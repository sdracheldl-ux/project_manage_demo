import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Mouhua from './pages/Mouhua'
import MouhuaDetail from './pages/MouhuaDetail'
import Zaitan from './pages/Zaitan'
import ZaitanDetail from './pages/ZaitanDetail'
import Qianyue from './pages/Qianyue'
import QianyueDetail from './pages/QianyueDetail'
import Luodi from './pages/Luodi'
import LuodiDetail from './pages/LuodiDetail'
import Yanpan from './pages/Yanpan'
import YanpanDetail from './pages/YanpanDetail'
import Tuiku from './pages/Tuiku'
import TuikuDetail from './pages/TuikuDetail'
import Targets from './pages/performance/Targets'
import ProgressTracking from './pages/performance/ProgressTracking'
import ApprovalManagement from './pages/performance/ApprovalManagement'
import CategoryPerformancePage from './pages/performance/CategoryPerformancePage'
import DashboardProject from './pages/DashboardProject'
import Account from './pages/system/Account'
import Role from './pages/system/Role'
import Log from './pages/system/Log'
import Field from './pages/system/Field'
import Overdue from './pages/system/Overdue'
import Notice from './pages/system/Notice'
import Profile from './pages/system/Profile'
import DashboardH5 from './pages/DashboardH5'
import EnterpriseSearch from './pages/EnterpriseSearch'
import EnterpriseDetail from './pages/enterprise/EnterpriseDetail'
import EnterpriseResult from './pages/enterprise/EnterpriseResult'
import EnterpriseFavorites from './pages/enterprise/EnterpriseFavorites'
import IndustryRankings from './pages/enterprise/IndustryRankings'
import IndustryReports from './pages/enterprise/IndustryReports'
import ReportEditor from './pages/enterprise/ReportEditor'

function App() {
  return (
    <Routes>
      {/* H5 移动端页面（无侧边栏布局） */}
      <Route path="/h5/dashboard" element={<DashboardH5 />} />

      {/* 研报编辑页（独立全屏，不走 MainLayout） */}
      <Route path="/intelligence/reports/edit/:id?" element={<ReportEditor />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/project/zaitan" replace />} />
        <Route path="project/mouhua" element={<Mouhua />} />
        <Route path="project/mouhua/detail/:id" element={<MouhuaDetail />} />
        <Route path="project/zaitan" element={<Zaitan />} />
        <Route path="project/zaitan/detail/:id" element={<ZaitanDetail />} />
        <Route path="project/qianyue" element={<Qianyue />} />
        <Route path="project/qianyue/detail/:id" element={<QianyueDetail />} />
        <Route path="project/luodi" element={<Luodi />} />
        <Route path="project/luodi/detail/:id" element={<LuodiDetail />} />
        <Route path="project/yanpan" element={<Yanpan />} />
        <Route path="project/yanpan/detail/:id" element={<YanpanDetail />} />
        <Route path="project/tuiku" element={<Tuiku />} />
        <Route path="project/tuiku/detail/:id" element={<TuikuDetail />} />
        <Route path="performance/park" element={<CategoryPerformancePage category="park" />} />
        <Route path="performance/soe" element={<CategoryPerformancePage category="soe" />} />
        <Route path="performance/dept" element={<CategoryPerformancePage category="dept" />} />
        <Route path="performance" element={<Navigate to="/performance/park" replace />} />
        <Route path="dashboard/project" element={<DashboardProject />} />
        <Route path="dashboard/perf" element={<Navigate to="/dashboard/project" replace />} />
        <Route path="intelligence/enterprise" element={<EnterpriseSearch />} />
        <Route path="intelligence/enterprise/result" element={<EnterpriseResult />} />
        <Route path="intelligence/enterprise/favorites" element={<EnterpriseFavorites />} />
        <Route path="intelligence/enterprise/rankings" element={<IndustryRankings />} />
        <Route path="intelligence/reports" element={<IndustryReports />} />
        <Route path="intelligence/enterprise/detail/:name" element={<EnterpriseDetail />} />
        <Route path="system/account" element={<Account />} />
        <Route path="system/role" element={<Role />} />
        <Route path="system/log" element={<Log />} />
        <Route path="system/field" element={<Field />} />
        <Route path="system/overdue" element={<Overdue />} />
        <Route path="system/notice" element={<Notice />} />
        <Route path="system/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App
