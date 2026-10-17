import { Layout, Menu, theme } from 'antd';
import { BrowserRouter } from 'react-router-dom';

import { Navigations, AppRoutes } from './router/router';

const { Content, Footer, Sider } = Layout;

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

export default function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const AppSider = () => (
    <Sider style={siderStyle}>
      <div className="demo-logo-vertical">FleetCon</div>
      <Navigations />
    </Sider>
  );

  const PageLayout = () => (
    <Layout>
      {/* <Header style={{ padding: 0, background: colorBgContainer }} /> */}
      <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
        <AppRoutes />
      </Content>
      <Footer style={{ textAlign: 'center' }}></Footer>
    </Layout>
  );

  return (
    <BrowserRouter>
      <Layout hasSider>
        <AppSider />
        <PageLayout />
      </Layout>
    </BrowserRouter>
  );
}
