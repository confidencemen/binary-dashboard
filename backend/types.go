package main

// 与前端 src/types/dashboard.ts 对齐的 JSON 结构（camelCase）。

type analysisQuery struct {
	ProductLine string `json:"productLine"`
	Product     string `json:"product"`
	Version     string `json:"version"`
	Capability  string `json:"capability"`
	KeyProcess  string `json:"keyProcess,omitempty"`
}

type productVersionNode struct {
	Key         string               `json:"key"`
	Title       string               `json:"title"`
	ProductLine string               `json:"productLine,omitempty"`
	Product     string               `json:"product,omitempty"`
	Version     string               `json:"version,omitempty"`
	Enabled     bool                 `json:"enabled,omitempty"`
	Children    []productVersionNode `json:"children,omitempty"`
}

type capabilityNode struct {
	Key        string           `json:"key"`
	Title      string           `json:"title"`
	Capability string           `json:"capability,omitempty"`
	Enabled    bool             `json:"enabled,omitempty"`
	Children   []capabilityNode `json:"children,omitempty"`
}

type navTreeData struct {
	Products          []productVersionNode `json:"products"`
	Capabilities      []capabilityNode     `json:"capabilities"`
	KeyProcessOptions []string             `json:"keyProcessOptions"`
}

type analysisStatus struct {
	Completed bool   `json:"completed"`
	Status    string `json:"status"`
	Progress  int    `json:"progress"`
	Message   string `json:"message,omitempty"`
}

type analysisStartResult struct {
	JobID   string `json:"jobId"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

type analysisStage struct {
	Name   string `json:"name"`
	Status string `json:"status"`
}

type analysisProgress struct {
	JobID    string          `json:"jobId"`
	Status   string          `json:"status"`
	Progress int             `json:"progress"`
	Stage    string          `json:"stage"`
	Message  string          `json:"message"`
	Stages   []analysisStage `json:"stages"`
}

type metricBreakdown struct {
	SystemLib64      int `json:"system_lib64"`
	SystemBin        int `json:"system_bin"`
	VendorLib64      int `json:"vendor_lib64"`
	VendorBin        int `json:"vendor_bin"`
	IndependentBuild int `json:"independent_build"`
}

type metricItem struct {
	Key       string          `json:"key"`
	Title     string          `json:"title"`
	Value     float64         `json:"value"`
	Unit      string          `json:"unit"`
	Breakdown metricBreakdown `json:"breakdown"`
}

type analysisSummary struct {
	Product              string `json:"product"`
	Version              string `json:"version"`
	Mode                 string `json:"mode"`
	Chip                 string `json:"chip"`
	HardwareCFISupported bool   `json:"hardwareCfiSupported"`
}

type binaryColumnDef struct {
	Key   string `json:"key"`
	Title string `json:"title"`
	Width int    `json:"width,omitempty"`
}

type binaryRecord struct {
	ID         string            `json:"id"`
	Name       string            `json:"name"`
	Component  string            `json:"component"`
	Owner      string            `json:"owner"`
	SourcePath string            `json:"sourcePath"`
	Values     map[string]string `json:"values"`
}

type dashboardData struct {
	Summary       analysisSummary   `json:"summary"`
	Metrics       []metricItem      `json:"metrics"`
	BinaryColumns []binaryColumnDef `json:"binaryColumns"`
	Binaries      []binaryRecord    `json:"binaries"`
}
