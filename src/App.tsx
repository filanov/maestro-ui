import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ClustersPage from './pages/ClustersPage'
import ClusterDetailPage from './pages/ClusterDetailPage'
import AgentDetailPage from './pages/AgentDetailPage'
import ExecutionsPage from './pages/ExecutionsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/clusters" replace />} />
        <Route path="/clusters" element={<ClustersPage />} />
        <Route path="/clusters/:clusterId" element={<ClusterDetailPage />} />
        <Route path="/agents/:agentId" element={<AgentDetailPage />} />
        <Route path="/executions" element={<ExecutionsPage />} />
      </Routes>
    </Layout>
  )
}

export default App
