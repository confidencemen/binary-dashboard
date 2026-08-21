package main

var binaryColumns = []binaryColumnDef{
	{Key: "clangCfi", Title: "Clang-cfi", Width: 140},
	{Key: "pacBe", Title: "PAC后向CFI", Width: 140},
	{Key: "pacForwardCfi", Title: "PAC前向CFI", Width: 140},
	{Key: "bti", Title: "BTI", Width: 140},
	{Key: "stackProtect", Title: "栈保护", Width: 140},
	{Key: "retGuard", Title: "retGuard后向CFI", Width: 140},
	{Key: "pacDfi", Title: "PAC-DFI", Width: 140},
	{Key: "ubsan", Title: "UBSAN", Width: 140},
	{Key: "bufferOverflow", Title: "缓冲区溢出", Width: 140},
	{Key: "integerOverflow", Title: "整数溢出", Width: 140},
	{Key: "pie", Title: "PIE覆盖率", Width: 140},
	{Key: "relro", Title: "RELRO", Width: 140},
}

var keyProcessSet = map[string][]string{
	"关键系统进程": {"init", "appspawn", "nativespawn", "samgr", "foundation", "servicemanager"},
	"相机服务进程": {"camera_server", "libcamera_host.so", "vendor.camera.hal"},
	"通信服务进程": {"libtelephony.so", "telephony_service", "libwifi_manager.so", "wifi_manager_service", "libbluetooth.so", "bluetooth_service", "libnetstack.so"},
	"支付安全进程": {"libhuks.so", "libaccess_token.so", "libdevice_auth.so", "libcrypto.so", "libssl.so"},
	"锁屏认证进程": {"libaccess_token.so", "libhuks.so", "libdevice_auth.so", "multimodalinput"},
}

func valuesFromFlags(flags string) map[string]string {
	out := make(map[string]string, len(binaryColumns))
	for i, col := range binaryColumns {
		if i < len(flags) {
			out[col.Key] = string(flags[i])
		}
	}
	return out
}

func mergeValues(flags string, extra map[string]string) map[string]string {
	out := valuesFromFlags(flags)
	for k, v := range extra {
		out[k] = v
	}
	return out
}

func row(id, name, component, owner, path, flags string, extra map[string]string) binaryRecord {
	return binaryRecord{
		ID:         id,
		Name:       name,
		Component:  component,
		Owner:      owner,
		SourcePath: path,
		Values:     mergeValues(flags, extra),
	}
}

func sampleBinaries(prefix string) []binaryRecord {
	return []binaryRecord{
		row(prefix+"-demo", "libvalues_demo.so", "example", "示例 00000001", "example/values_field", "YNYNYYYYYYYY", map[string]string{
			"pacForwardCfi":  "NA",
			"bti":            "PARTIAL",
			"retGuard":       "NA",
			"bufferOverflow": "PARTIAL",
		}),
		row(prefix+"-0", "libhwui.so", "graphic", "张伟 00381234", "foundation/graphic/graphic_2d", "YYYYYYNYYYYY", nil),
		row(prefix+"-1", "libbinder.so", "ipc", "李娜 00384567", "foundation/communication/ipc", "YYYYYYYYYYYY", nil),
		row(prefix+"-2", "libc.so", "musl", "王强 00382301", "third_party/musl", "YYYYYYNYYYYY", nil),
		row(prefix+"-3", "libcrypto.so", "crypto", "陈晨 00380119", "base/security/crypto_framework", "YYYYYYYNYYYY", nil),
		row(prefix+"-4", "libssl.so", "crypto", "陈晨 00380119", "base/security/crypto_framework", "YYYYYYYNYYYY", nil),
		row(prefix+"-5", "libaccess_token.so", "access_token", "宋宁 00385507", "base/security/access_token", "YYYYYYYYYYYY", nil),
		row(prefix+"-6", "libhuks.so", "huks", "唐雪 00386618", "base/security/huks", "YYYYYYYYYYYY", nil),
		row(prefix+"-7", "libdevice_auth.so", "device_auth", "许峰 00387729", "base/security/device_auth", "YYYYYYYNYYYY", nil),
		row(prefix+"-8", "init", "startup", "马超 00380941", "base/startup/init", "YYYYYYYYYYYY", nil),
		row(prefix+"-9", "appspawn", "startup", "马超 00380941", "base/startup/appspawn", "YYYYYYYYYYYY", nil),
		row(prefix+"-10", "nativespawn", "startup", "马超 00380941", "base/startup/appspawn", "YYYYYYNYYYYY", nil),
		row(prefix+"-11", "samgr", "systemabilitymgr", "蒋欣 00381252", "foundation/systemabilitymgr/samgr", "YYYYYYYYYYYY", nil),
		row(prefix+"-12", "foundation", "systemabilitymgr", "蒋欣 00381252", "foundation/systemabilitymgr/safwk", "YYYYYYNYYYYY", nil),
		row(prefix+"-13", "servicemanager", "ipc", "李娜 00384567", "foundation/communication/ipc", "YYYYYYYYYYYY", nil),
		row(prefix+"-14", "libcamera_host.so", "camera", "冯雪 00382210", "foundation/multimedia/camera_framework", "YYYYYYNYYYYY", nil),
		row(prefix+"-15", "camera_server", "camera", "冯雪 00382210", "foundation/multimedia/camera_framework", "YYYYYYNYYYYY", nil),
		row(prefix+"-16", "vendor.camera.hal", "vendor_camera", "冯雪 00382210", "vendor/huawei/camera", "YNYNYNYNYYYY", nil),
		row(prefix+"-17", "libnetstack.so", "netstack", "曹丽 00385502", "foundation/communication/netstack", "YYYYYYYYYYYY", nil),
		row(prefix+"-18", "libwifi_manager.so", "wifi", "邓凯 00386630", "foundation/communication/wifi", "YYYYYYNYYYYY", nil),
		row(prefix+"-19", "wifi_manager_service", "wifi", "邓凯 00386630", "foundation/communication/wifi", "YYYYYYNYYYYY", nil),
		row(prefix+"-20", "libbluetooth.so", "bluetooth", "彭涛 00387741", "foundation/communication/bluetooth", "YYYYYNYNYYYY", nil),
		row(prefix+"-21", "bluetooth_service", "bluetooth", "彭涛 00387741", "foundation/communication/bluetooth", "YYYYYNYNYYYY", nil),
		row(prefix+"-22", "libtelephony.so", "telephony", "萧然 00388852", "foundation/communication/telephony", "YYYYYYNYYYYY", nil),
		row(prefix+"-23", "telephony_service", "telephony", "萧然 00388852", "foundation/communication/telephony", "YYYYYYNYYYYY", nil),
		row(prefix+"-24", "multimodalinput", "multimodalinput", "崔宁 00383321", "foundation/multimodalinput/input", "YYYYYYYYYYYY", nil),
	}
}

func metricsOf(total metricBreakdown, percents [5]float64, enabled [5]metricBreakdown) []metricItem {
	return []metricItem{
		{Key: "total", Title: "二进制总数", Value: float64(total.SystemLib64 + total.SystemBin + total.VendorLib64 + total.VendorBin + total.IndependentBuild), Unit: "count", Breakdown: total},
		{Key: "clangCfi", Title: "Clang 前向 CFI 使能比例", Value: percents[0], Unit: "percent", Breakdown: enabled[0]},
		{Key: "pacCfi", Title: "PAC 后向 CFI 使能比例", Value: percents[1], Unit: "percent", Breakdown: enabled[1]},
		{Key: "bti", Title: "BTI 使能比例", Value: percents[2], Unit: "percent", Breakdown: enabled[2]},
		{Key: "stackProtect", Title: "栈保护使能比例", Value: percents[3], Unit: "percent", Breakdown: enabled[3]},
		{Key: "retGuard", Title: "retGuard 使能比例", Value: percents[4], Unit: "percent", Breakdown: enabled[4]},
	}
}

func buildDashboardCatalog() map[string]dashboardData {
	cmm37 := dashboardData{
		Summary: analysisSummary{
			Product: "CMM(CosmosU)", Version: "HO7.0.0.37", Mode: "用户态",
			Chip: "Kirin 9030", HardwareCFISupported: true,
		},
		Metrics: metricsOf(
			metricBreakdown{1180, 520, 640, 340, 100},
			[5]float64{86.4, 78.2, 71.5, 91.0, 68.3},
			[5]metricBreakdown{
				{1020, 450, 510, 250, 100},
				{930, 400, 460, 220, 100},
				{850, 360, 420, 190, 100},
				{1080, 480, 560, 290, 100},
				{810, 340, 400, 170, 100},
			},
		),
		BinaryColumns: binaryColumns,
		Binaries:      sampleBinaries("cmm-37"),
	}

	cmm21 := dashboardData{
		Summary: analysisSummary{
			Product: "CMM(CosmosU)", Version: "HO7.0.0.21", Mode: "用户态",
			Chip: "Kirin 9030", HardwareCFISupported: false,
		},
		Metrics: metricsOf(
			metricBreakdown{1100, 490, 600, 240, 80},
			[5]float64{79.6, 70.1, 62.4, 86.8, 58.9},
			[5]metricBreakdown{
				{900, 380, 440, 180, 80},
				{800, 330, 390, 150, 80},
				{720, 290, 340, 130, 80},
				{980, 420, 500, 200, 80},
				{680, 270, 310, 120, 80},
			},
		),
		BinaryColumns: binaryColumns,
		Binaries:      sampleBinaries("cmm-21"),
	}

	had37 := dashboardData{
		Summary: analysisSummary{
			Product: "HAD(Harden)", Version: "HO7.0.0.37", Mode: "用户态",
			Chip: "Kirin 9000C", HardwareCFISupported: true,
		},
		Metrics: metricsOf(
			metricBreakdown{900, 420, 480, 240, 100},
			[5]float64{81.2, 74.0, 66.8, 88.5, 61.2},
			[5]metricBreakdown{
				{760, 340, 390, 180, 100},
				{690, 310, 350, 160, 100},
				{620, 280, 310, 140, 100},
				{820, 380, 430, 200, 100},
				{550, 250, 300, 130, 100},
			},
		),
		BinaryColumns: binaryColumns,
		Binaries:      sampleBinaries("had-37"),
	}

	return map[string]dashboardData{
		"手机|CMM(CosmosU)|HO7.0.0.37": cmm37,
		"手机|CMM(CosmosU)|HO7.0.0.21": cmm21,
		"PC|HAD(Harden)|HO7.0.0.37":  had37,
	}
}

func lookupDashboard(q analysisQuery) (dashboardData, bool) {
	data, ok := dashboardCatalog[q.ProductLine+"|"+q.Product+"|"+q.Version]
	if !ok {
		return dashboardData{}, false
	}
	if q.KeyProcess == "" || q.KeyProcess == "全部进程" {
		return data, true
	}
	allow := map[string]struct{}{}
	for _, name := range keyProcessSet[q.KeyProcess] {
		allow[name] = struct{}{}
	}
	filtered := make([]binaryRecord, 0, len(data.Binaries))
	for _, item := range data.Binaries {
		if _, hit := allow[item.Name]; hit {
			filtered = append(filtered, item)
		}
	}
	cloned := data
	cloned.Binaries = filtered
	return cloned, true
}

var dashboardCatalog = buildDashboardCatalog()
