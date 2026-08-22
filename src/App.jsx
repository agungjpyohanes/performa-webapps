// Cari bagian router view di dalam mainContent pada src/App.jsx:
{viewType === 'analytics' && (
  <ProcessAnalyticsView
    tabKey={viewKey}
    data={data}
    period={period}
    onOpenList={openRecordList}
  />
)}

{viewType === 'operator_shift' && (
  <OperatorShiftView
    data={data}
    period={period}
    onOpenList={openRecordList}
  />
)}

{viewType === 'executive_overall' && (
  <ExecutiveOverallView
    data={data}
    period={period}
    onOpenList={openRecordList}
  />
)}