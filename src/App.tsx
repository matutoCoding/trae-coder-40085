import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import ApplicationList from "./pages/Application/ApplicationList";
import NewApplication from "./pages/Application/NewApplication";
import ApplicationDetail from "./pages/Application/ApplicationDetail";
import ReminderList from "./pages/Reminder/ReminderList";
import BatchList from "./pages/Batch/BatchList";
import NewBatch from "./pages/Batch/NewBatch";
import BatchDetail from "./pages/Batch/BatchDetail";
import TracePage from "./pages/Recall/TracePage";
import RecallList from "./pages/Recall/RecallList";
import NewRecall from "./pages/Recall/NewRecall";
import RecallDetail from "./pages/Recall/RecallDetail";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<ApplicationList />} />
          <Route path="/applications/new" element={<NewApplication />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/reminders" element={<ReminderList />} />
          <Route path="/batches" element={<BatchList />} />
          <Route path="/batches/new" element={<NewBatch />} />
          <Route path="/batches/:id" element={<BatchDetail />} />
          <Route path="/trace" element={<TracePage />} />
          <Route path="/recalls" element={<RecallList />} />
          <Route path="/recalls/new" element={<NewRecall />} />
          <Route path="/recalls/:id" element={<RecallDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}
