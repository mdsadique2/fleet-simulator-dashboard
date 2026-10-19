import { Layout, theme, ConfigProvider, Switch } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { Navigations, AppRoutes } from './router/router';
import { useState } from 'react';
import {
  SunFilled,
  MoonFilled
} from '@ant-design/icons';

import './App.css'


const { Content, Header } = Layout;

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const AppHeader = () => (
    <Header className='appHeader'>
      <div className='logo'>
        FleetConsole
      </div>
      <div className='actions'>
        <Navigations />
        <div className='switch'>
          <span>{isDarkMode ? <SunFilled /> : <MoonFilled />}</span>
          <Switch size="small" value={isDarkMode} onChange={setIsDarkMode} />
        </div>
      </div>
    </Header>
  );

  const PageLayout = () => (
    <Layout>
      {/* <Header style={{ padding: 0, background: colorBgContainer }} /> */}
      <Content style={{ margin: '24px 48px', overflow: 'initial' }}>
        <AppRoutes />
      </Content>
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
