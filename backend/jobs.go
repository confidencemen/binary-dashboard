package main

import (
	"fmt"
	"sync"
	"time"
)

const analysisDuration = 8 * time.Second

var analysisStages = []string{
	"采集二进制清单",
	"解析编译与链接选项",
	"Clang 前向 CFI 扫描",
	"PAC / BTI 能力检测",
	"栈保护与 retGuard 分析",
	"汇总统计结果",
}

type analysisJob struct {
	JobID     string
	QueryKey  string
	Status    string
	StartedAt time.Time
}

var (
	jobsMu sync.Mutex
	jobs   = map[string]*analysisJob{}
)

func jobKey(q analysisQuery) string {
	return q.ProductLine + "|" + q.Product + "|" + q.Version + "|" + q.Capability
}

func isCapabilityOpen(capability string) bool {
	return capability == "user-enablement"
}

func isProductOpen(q analysisQuery) bool {
	switch {
	case q.ProductLine == "手机" && q.Product == "CMM(CosmosU)" && (q.Version == "HO7.0.0.37" || q.Version == "HO7.0.0.21"):
		return true
	case q.ProductLine == "PC" && q.Product == "HAD(Harden)" && q.Version == "HO7.0.0.37":
		return true
	default:
		return false
	}
}

func startJob(q analysisQuery) *analysisJob {
	key := jobKey(q)
	job := &analysisJob{
		JobID:     fmt.Sprintf("job-%d", time.Now().UnixMilli()),
		QueryKey:  key,
		Status:    "running",
		StartedAt: time.Now(),
	}
	jobsMu.Lock()
	jobs[key] = job
	jobsMu.Unlock()
	return job
}

func getJob(q analysisQuery) *analysisJob {
	jobsMu.Lock()
	defer jobsMu.Unlock()
	return jobs[jobKey(q)]
}

func snapshotProgress(job *analysisJob) analysisProgress {
	elapsed := time.Since(job.StartedAt)
	progress := int(elapsed * 100 / analysisDuration)
	status := job.Status
	if status == "running" && elapsed >= analysisDuration {
		status = "completed"
		progress = 100
		jobsMu.Lock()
		job.Status = "completed"
		jobsMu.Unlock()
	}
	if status == "completed" {
		progress = 100
	}
	if progress > 100 {
		progress = 100
	}
	if progress < 0 {
		progress = 0
	}

	stageIndex := len(analysisStages) - 1
	if progress < 100 {
		stageIndex = progress * len(analysisStages) / 100
		if stageIndex >= len(analysisStages) {
			stageIndex = len(analysisStages) - 1
		}
	}

	stages := make([]analysisStage, len(analysisStages))
	for i, name := range analysisStages {
		st := "pending"
		if i < stageIndex {
			st = "done"
		} else if i == stageIndex {
			if progress >= 100 {
				st = "done"
			} else {
				st = "running"
			}
		}
		stages[i] = analysisStage{Name: name, Status: st}
	}

	message := "正在执行：" + analysisStages[stageIndex]
	if status == "completed" {
		message = "分析已完成，请点击「结果查看」查看统计结果。"
	}

	return analysisProgress{
		JobID:    job.JobID,
		Status:   status,
		Progress: progress,
		Stage:    analysisStages[stageIndex],
		Message:  message,
		Stages:   stages,
	}
}

func emptyProgress() analysisProgress {
	stages := make([]analysisStage, len(analysisStages))
	for i, name := range analysisStages {
		stages[i] = analysisStage{Name: name, Status: "pending"}
	}
	return analysisProgress{
		JobID:    "",
		Status:   "not_found",
		Progress: 0,
		Stage:    "",
		Message:  "未找到对应的分析任务",
		Stages:   stages,
	}
}
