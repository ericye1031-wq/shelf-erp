import { useEffect, useState, useMemo } from "react";
import {
  Box, TextField, MenuItem, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
} from "@mui/material";
import PageHeader from "@/components/common/PageHeader";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { useM10Store } from "@/stores/useM10Store";
import { formatDate } from "@/utils/format";

const STATUS_LABELS: Record<string, string> = {
  pending: "待排程", running: "生产中", completed: "已完成", delayed: "已延误",
};
const STATUS_HEX: Record<string, string> = {
  pending: "#2196F3", running: "#4CAF50", completed: "#9E9E9E", delayed: "#F44336",
};
const STATUS_COLORS: Record<string, "info" | "success" | "default" | "error"> = {
  pending: "info", running: "success", completed: "default", delayed: "error",
};

const GANTT_LEFT_WIDTH = 120;
const HOUR_WIDTH = 50;
const ROW_HEIGHT = 36;

export default function SchedulePage() {
  const { schedule, loading, fetchSchedule, workOrders, fetchWorkOrders, equipment, fetchEquipment } = useM10Store();
  const [equipFilter, setEquipFilter] = useState("");
  const [woFilter, setWoFilter] = useState("");

  useEffect(() => { fetchSchedule(); fetchWorkOrders(); fetchEquipment(); }, [fetchSchedule, fetchWorkOrders, fetchEquipment]);

  const filtered = useMemo(() => {
    return schedule.filter((s) => {
      if (equipFilter && s.equipmentName !== equipFilter) return false;
      if (woFilter && !s.workOrderId.includes(woFilter)) return false;
      return true;
    });
  }, [schedule, equipFilter, woFilter]);

  const counts = useMemo(() => ({
    total: filtered.length,
    running: filtered.filter((s) => s.status === "running").length,
    delayed: filtered.filter((s) => s.status === "delayed").length,
    pending: filtered.filter((s) => s.status === "pending").length,
  }), [filtered]);

  // Gantt calculation
  const ganttData = useMemo(() => {
    if (filtered.length === 0) return { equipmentNames: [] as string[], barsByEquip: new Map<string, typeof filtered>(), minTime: 0, maxTime: 24, range: 24 };
    let minT = Infinity, maxT = -Infinity;
    const map = new Map<string, typeof filtered>();
    filtered.forEach((s) => {
      const t0 = new Date(s.startTime).getTime();
      const t1 = new Date(s.endTime).getTime();
      if (t0 < minT) minT = t0;
      if (t1 > maxT) maxT = t1;
      const arr = map.get(s.equipmentName) || [];
      arr.push(s);
      map.set(s.equipmentName, arr);
    });
    if (minT === maxT) maxT = minT + 86400000;
    const range = maxT - minT;
    return { equipmentNames: Array.from(map.keys()), barsByEquip: map, minTime: minT, maxTime: maxT, range };
  }, [filtered]);

  const ganttWidth = Math.max(400, (ganttData.range / 3600000) * HOUR_WIDTH + GANTT_LEFT_WIDTH);

  const timeLabels = useMemo(() => {
    if (filtered.length === 0) return [];
    const totalHours = Math.ceil(ganttData.range / 3600000);
    return Array.from({ length: Math.min(totalHours + 1, 24) }, (_, i) => {
      const d = new Date(ganttData.minTime + i * 3600000);
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
    });
  }, [ganttData, filtered]);

  return (
    <Box sx={{ position: "relative" }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="生产排程" subtitle={`总计 ${counts.total} | 进行中 ${counts.running} | 延误 ${counts.delayed}`} />

      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <TextField select size="small" label="设备" value={equipFilter}
          onChange={(e) => setEquipFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">全部</MenuItem>
          {equipment.map((eq) => (
            <MenuItem key={eq.id} value={eq.name}>{eq.name}</MenuItem>
          ))}
        </TextField>
        <TextField size="small" label="工单ID" value={woFilter}
          onChange={(e) => setWoFilter(e.target.value)} sx={{ minWidth: 160 }} />
      </Box>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>暂无排程数据</Typography>
      ) : (
        <>
          {/* Gantt Chart */}
          <Paper variant="outlined" sx={{ mb: 3, overflow: "auto" }}>
            <Box sx={{ minWidth: ganttWidth, fontSize: 12 }}>
              {/* Time axis header */}
              <Box sx={{ display: "flex", borderBottom: 1, borderColor: "divider", height: 30 }}>
                <Box sx={{ width: GANTT_LEFT_WIDTH, flexShrink: 0, borderRight: 1, borderColor: "divider", display: "flex", alignItems: "center", px: 1, fontWeight: 700, backgroundColor: "#F5F5F5" }}>
                  设备 / 时间
                </Box>
                <Box sx={{ flex: 1, display: "flex" }}>
                  {timeLabels.map((label, i) => (
                    <Box key={i} sx={{ flex: 1, textAlign: "center", borderRight: i < timeLabels.length - 1 ? 1 : 0, borderColor: "divider", fontSize: 10, color: "text.secondary", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {i % 4 === 0 ? label : ""}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Equipment rows */}
              {ganttData.equipmentNames.map((eqName) => {
                const bars = ganttData.barsByEquip.get(eqName) || [];
                return (
                  <Box key={eqName} sx={{ display: "flex", borderBottom: 1, borderColor: "divider", height: ROW_HEIGHT, position: "relative" }}>
                    <Box sx={{ width: GANTT_LEFT_WIDTH, flexShrink: 0, px: 1, display: "flex", alignItems: "center", fontWeight: 600, fontSize: 12, borderRight: 1, borderColor: "divider", backgroundColor: "#FAFAFA" }}>
                      {eqName}
                    </Box>
                    <Box sx={{ position: "relative", flex: 1 }}>
                      {bars.map((bar) => {
                        const startMs = new Date(bar.startTime).getTime();
                        const endMs = new Date(bar.endTime).getTime();
                        const leftPct = ((startMs - ganttData.minTime) / ganttData.range) * 100;
                        const widthPct = Math.max(((endMs - startMs) / ganttData.range) * 100, 0.5);
                        return (
                          <Box
                            key={bar.id}
                            sx={{
                              position: "absolute",
                              left: `${leftPct}%`,
                              top: 5,
                              height: ROW_HEIGHT - 10,
                              width: `${widthPct}%`,
                              backgroundColor: STATUS_HEX[bar.status] || "#2196F3",
                              borderRadius: "3px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 600,
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              px: 0.5,
                              cursor: "pointer",
                              "&:hover": { opacity: 0.85 },
                            }}
                            title={`${bar.workOrderId} | ${formatDate(bar.startTime, "MM-DD HH:mm")} - ${formatDate(bar.endTime, "MM-DD HH:mm")} | ${STATUS_LABELS[bar.status]}`}
                          >
                            {bar.workOrderId}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Legend */}
            <Box sx={{ display: "flex", gap: 2, p: 1, flexWrap: "wrap" }}>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 0.5, backgroundColor: STATUS_HEX[key] }} />
                  <Typography variant="caption">{label}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Table below */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#005591" }}>工单ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#005591" }}>设备</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#005591" }}>工序ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#005591" }}>开始时间</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#005591" }}>结束时间</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#005591" }}>状态</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} hover
                    sx={{
                      borderLeft: 4,
                      borderColor:
                        item.status === "running" ? "success.main" :
                        item.status === "delayed" ? "error.main" :
                        item.status === "completed" ? "grey.400" : "info.main",
                    }}
                  >
                    <TableCell>{item.workOrderId}</TableCell>
                    <TableCell>{item.equipmentName}</TableCell>
                    <TableCell>{item.processStepId}</TableCell>
                    <TableCell>{formatDate(item.startTime, "YYYY-MM-DD HH:mm")}</TableCell>
                    <TableCell>{formatDate(item.endTime, "YYYY-MM-DD HH:mm")}</TableCell>
                    <TableCell>
                      <Chip label={STATUS_LABELS[item.status] || item.status} size="small"
                        color={STATUS_COLORS[item.status] || "default"} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
