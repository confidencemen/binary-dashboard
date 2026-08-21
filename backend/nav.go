package main

func buildNavTree() navTreeData {
	version := func(key, title, line, product, version string, enabled bool) productVersionNode {
		return productVersionNode{
			Key: key, Title: title, ProductLine: line, Product: product, Version: version, Enabled: enabled,
		}
	}

	return navTreeData{
		Products: []productVersionNode{
			{
				Key:   "product-root",
				Title: "产品与版本管理",
				Children: []productVersionNode{
					{
						Key: "line-phone", Title: "手机", ProductLine: "手机",
						Children: []productVersionNode{
							{
								Key: "prod-CMM", Title: "CMM(CosmosU)", ProductLine: "手机", Product: "CMM(CosmosU)",
								Children: []productVersionNode{
									version("ver-phone-CMM-HO7.0.0.37", "HO7.0.0.37", "手机", "CMM(CosmosU)", "HO7.0.0.37", true),
									version("ver-phone-CMM-HO7.0.0.21", "HO7.0.0.21", "手机", "CMM(CosmosU)", "HO7.0.0.21", true),
								},
							},
							{
								Key: "prod-ALN", Title: "ALN(Allen)", ProductLine: "手机", Product: "ALN(Allen)",
								Children: []productVersionNode{
									version("ver-phone-ALN-HO7.0.0.37", "HO7.0.0.37", "手机", "ALN(Allen)", "HO7.0.0.37", false),
								},
							},
						},
					},
					{
						Key: "line-pc", Title: "PC", ProductLine: "PC",
						Children: []productVersionNode{
							{
								Key: "prod-HAD", Title: "HAD(Harden)", ProductLine: "PC", Product: "HAD(Harden)",
								Children: []productVersionNode{
									version("ver-pc-HAD-HO7.0.0.37", "HO7.0.0.37", "PC", "HAD(Harden)", "HO7.0.0.37", true),
									version("ver-pc-HAD-HO6.1.0.135", "HO6.1.0.135", "PC", "HAD(Harden)", "HO6.1.0.135", false),
								},
							},
						},
					},
					{
						Key: "line-tablet", Title: "平板", ProductLine: "平板",
						Children: []productVersionNode{
							{
								Key: "prod-DAL", Title: "DAL(Dail)", ProductLine: "平板", Product: "DAL(Dail)",
								Children: []productVersionNode{
									version("ver-tablet-DAL-HO7.0.0.34", "HO7.0.0.34", "平板", "DAL(Dail)", "HO7.0.0.34", false),
								},
							},
						},
					},
				},
			},
		},
		Capabilities: []capabilityNode{
			{
				Key:   "capability-root",
				Title: "安全能力管理",
				Children: []capabilityNode{
					{Key: "cap-user-enablement", Title: "用户态安全能力使能分析", Capability: "user-enablement", Enabled: true},
					{Key: "cap-user-function", Title: "用户态函数粒度安全分析", Capability: "user-function"},
					{Key: "cap-user-gadget", Title: "用户态高风险gadget分析", Capability: "user-gadget"},
					{Key: "cap-user-trend", Title: "用户态安全趋势图谱", Capability: "user-trend"},
					{Key: "cap-kernel-enablement", Title: "内核态安全能力使能分析", Capability: "kernel-enablement"},
					{Key: "cap-kernel-trend", Title: "内核态安全趋势图谱", Capability: "kernel-trend"},
				},
			},
		},
		KeyProcessOptions: []string{"全部进程", "关键系统进程", "相机服务进程", "通信服务进程", "支付安全进程", "锁屏认证进程"},
	}
}
