import { Layout, theme, ConfigProvider, Switch } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { Navigations, AppRoutes } from './router/router';
import { useState } from 'react';
import './App.css'

const { Content, Footer, Header } = Layout;

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const AppHeader = () => (
    <Header className='appHeader'>
      <div className='logo'>
        FleetConsole
      </div>
      <div className='actions'>
        <Switch size="small" value={isDarkMode} onChange={setIsDarkMode} />
      </div>
    </Header>
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
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
    <BrowserRouter>
      <Layout>
        <AppHeader />
        <PageLayout />
      </Layout>
    </BrowserRouter>
    </ConfigProvider>
  );
}
