interface WelcomePageProps {
  productLabel?: string;
  capabilityLabel?: string;
}

export default function WelcomePage({ productLabel, capabilityLabel }: WelcomePageProps) {
  return (
    <section className="welcome-page">
      <div className="welcome-page__card">
        <p className="welcome-page__eyebrow">HarmonyOS Binary Security</p>
        <h2>欢迎使用鸿蒙二进制安全治理看板</h2>
        <p className="welcome-page__lead">
          请先在左侧完成选项选择。未选择完整参数前，此处不会展示统计结果，以避免误读未就绪的数据。
        </p>

        <ol className="welcome-page__steps">
          <li>
            在「产品与版本管理」中选择产品与版本
            <span>{productLabel || '尚未选择产品版本'}</span>
          </li>
          <li>
            在「安全能力管理」中选择分析类型（当前仅「用户态安全能力使能分析」可选）
            <span>{capabilityLabel || '尚未选择安全能力'}</span>
          </li>
          <li>
            点击左下角「启动分析」，右侧将实时展示分析进度
          </li>
          <li>
            分析完成后，「结果查看」可用，点击即可加载统计结果
          </li>
        </ol>
      </div>
    </section>
  );
}
