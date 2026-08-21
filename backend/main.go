package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

func main() {
	addr := ":8080"
	if v := os.Getenv("PORT"); v != "" {
		addr = ":" + v
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/nav", handleNav)
	mux.HandleFunc("GET /api/analysis/status", handleAnalysisStatus)
	mux.HandleFunc("POST /api/analysis/start", handleAnalysisStart)
	mux.HandleFunc("GET /api/analysis/progress", handleAnalysisProgress)
	mux.HandleFunc("GET /api/dashboard", handleDashboard)

	log.Printf("binary dashboard demo listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, withCORS(mux)))
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func handleNav(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, buildNavTree())
}

func handleAnalysisStatus(w http.ResponseWriter, r *http.Request) {
	q := parseQuery(r)
	if err := requireQuery(q); err != "" {
		http.Error(w, err, http.StatusBadRequest)
		return
	}
	job := getJob(q)
	if job == nil {
		writeJSON(w, http.StatusOK, analysisStatus{
			Completed: false,
			Status:    "idle",
			Progress:  0,
			Message:   "当前选项尚未进行分析",
		})
		return
	}
	snap := snapshotProgress(job)
	writeJSON(w, http.StatusOK, analysisStatus{
		Completed: snap.Status == "completed",
		Status:    snap.Status,
		Progress:  snap.Progress,
		Message:   snap.Message,
	})
}

func handleAnalysisStart(w http.ResponseWriter, r *http.Request) {
	var q analysisQuery
	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		http.Error(w, "请求体不是合法 JSON", http.StatusBadRequest)
		return
	}
	if err := requireQuery(q); err != "" {
		http.Error(w, err, http.StatusBadRequest)
		return
	}
	if !isCapabilityOpen(q.Capability) {
		http.Error(w, "该安全能力尚未开放，暂不支持启动分析", http.StatusBadRequest)
		return
	}
	if !isProductOpen(q) {
		http.Error(w, "该产品版本尚未开放，暂不支持启动分析", http.StatusBadRequest)
		return
	}
	job := startJob(q)
	writeJSON(w, http.StatusOK, analysisStartResult{
		JobID:   job.JobID,
		Status:  "running",
		Message: "分析任务已启动",
	})
}

func handleAnalysisProgress(w http.ResponseWriter, r *http.Request) {
	q := parseQuery(r)
	if err := requireQuery(q); err != "" {
		http.Error(w, err, http.StatusBadRequest)
		return
	}
	job := getJob(q)
	if job == nil {
		writeJSON(w, http.StatusOK, emptyProgress())
		return
	}
	writeJSON(w, http.StatusOK, snapshotProgress(job))
}

func handleDashboard(w http.ResponseWriter, r *http.Request) {
	q := parseQuery(r)
	if err := requireQuery(q); err != "" {
		http.Error(w, err, http.StatusBadRequest)
		return
	}
	job := getJob(q)
	if job == nil {
		http.Error(w, "当前选项尚未进行分析，无法查看结果", http.StatusConflict)
		return
	}
	snap := snapshotProgress(job)
	if snap.Status != "completed" {
		http.Error(w, snap.Message, http.StatusConflict)
		return
	}
	data, ok := lookupDashboard(q)
	if !ok {
		http.Error(w, "未找到对应的结果数据", http.StatusNotFound)
		return
	}
	writeJSON(w, http.StatusOK, data)
}

func parseQuery(r *http.Request) analysisQuery {
	q := r.URL.Query()
	return analysisQuery{
		ProductLine: q.Get("productLine"),
		Product:     q.Get("product"),
		Version:     q.Get("version"),
		Capability:  q.Get("capability"),
		KeyProcess:  q.Get("keyProcess"),
	}
}

func requireQuery(q analysisQuery) string {
	if q.ProductLine == "" || q.Product == "" || q.Version == "" || q.Capability == "" {
		return "缺少 productLine / product / version / capability"
	}
	return ""
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(payload); err != nil {
		log.Printf("encode json: %v", err)
	}
}
