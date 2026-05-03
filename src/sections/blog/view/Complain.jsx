/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
/* eslint-disable */
import { useState, useEffect } from "react";
import {
  Container,
  Stack,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  InputAdornment,
  Divider,
  Avatar,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
// No external icon library needed — using inline emoji icons

const API_BASE_URL = "https://my-project-backend-ee4t.onrender.com/api/complaint";

// ─── Theme tokens ────────────────────────────────────────────────
const theme = {
  primary: "#1565C0",
  primaryLight: "#1976D2",
  primaryLighter: "#42A5F5",
  primaryBg: "#E3F2FD",
  primaryBgDeep: "#BBDEFB",
  white: "#FFFFFF",
  offWhite: "#F4F8FF",
  border: "#BBDEFB",
  textPrimary: "#0D2B5E",
  textSecondary: "#4A6FA5",
  textMuted: "#7B9CC0",
  // status
  pendingBg: "#FFF3E0",
  pendingText: "#E65100",
  pendingBorder: "#FFCC02",
  resolvedBg: "#E8F5E9",
  resolvedText: "#2E7D32",
  resolvedBorder: "#81C784",
  rejectedBg: "#FFEBEE",
  rejectedText: "#C62828",
  rejectedBorder: "#EF9A9A",
  // priority
  highBg: "#FFEBEE",
  highText: "#C62828",
  mediumBg: "#FFF8E1",
  mediumText: "#F57F17",
  lowBg: "#E8F5E9",
  lowText: "#2E7D32",
};

// ─── API ─────────────────────────────────────────────────────────
const complaintApi = {
  getAll: async () => {
    const res = await fetch(API_BASE_URL);
    const data = await res.json();
    return data.data;
  },
  updateStatus: async (id, status, resolution) => {
    const res = await fetch(`${API_BASE_URL}/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, resolution }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};

// ─── Helpers ─────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name || !name.trim()) return "?";
  return name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── Status chip styles ───────────────────────────────────────────
const statusStyle = (status) => {
  switch (status) {
    case "Pending":
      return { bgcolor: theme.pendingBg, color: theme.pendingText, borderColor: theme.pendingBorder };
    case "Resolved":
      return { bgcolor: theme.resolvedBg, color: theme.resolvedText, borderColor: theme.resolvedBorder };
    case "Rejected":
      return { bgcolor: theme.rejectedBg, color: theme.rejectedText, borderColor: theme.rejectedBorder };
    default:
      return { bgcolor: theme.primaryBg, color: theme.primary, borderColor: theme.primaryBgDeep };
  }
};

// ─── Priority chip styles ─────────────────────────────────────────
const priorityStyle = (priority) => {
  switch (priority) {
    case "High":
      return { bgcolor: theme.highBg, color: theme.highText };
    case "Medium":
      return { bgcolor: theme.mediumBg, color: theme.mediumText };
    case "Low":
      return { bgcolor: theme.lowBg, color: theme.lowText };
    default:
      return { bgcolor: theme.primaryBg, color: theme.primary };
  }
};

// ─── Priority bar color ───────────────────────────────────────────
const priorityBarColor = (priority) => {
  switch (priority) {
    case "High": return theme.highText;
    case "Medium": return theme.mediumText;
    case "Low": return theme.lowText;
    default: return theme.primary;
  }
};

// ─── DetailRow helper ─────────────────────────────────────────────
const DetailRow = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
    <Box sx={{ color: theme.primary, mt: "2px", flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.8px", color: theme.textMuted, fontWeight: 600, mb: "2px" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.9rem", color: theme.textPrimary, lineHeight: 1.5 }}>
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

// ─── Skeleton Card ────────────────────────────────────────────────
const SkeletonCard = () => (
  <Card sx={{ borderRadius: 3, border: `1px solid ${theme.border}`, boxShadow: "none", overflow: "hidden" }}>
    <Box sx={{ height: 4, bgcolor: theme.primaryBgDeep }} />
    <CardContent>
      {[80, 95, 60].map((w, i) => (
        <Box key={i} sx={{ height: 12, bgcolor: theme.primaryBg, borderRadius: 1, mb: 1.5, width: `${w}%`,
          animation: "pulse 1.4s ease infinite", animationDelay: `${i * 0.15}s`,
          "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } }
        }} />
      ))}
      <Box sx={{ height: 36, bgcolor: theme.primaryBg, borderRadius: 2, mt: 2 }} />
    </CardContent>
  </Card>
);

// ─── Filter Button ────────────────────────────────────────────────
const FilterBtn = ({ label, active, onClick, color }) => (
  <Button
    onClick={onClick}
    size="small"
    variant={active ? "contained" : "outlined"}
    sx={{
      borderRadius: 20,
      px: 2,
      py: 0.5,
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.3px",
      minWidth: 0,
      ...(active
        ? { bgcolor: color || theme.primary, borderColor: color || theme.primary, color: "#fff", "&:hover": { bgcolor: color || theme.primaryLight } }
        : { borderColor: theme.border, color: color || theme.textSecondary, bgcolor: "transparent", "&:hover": { bgcolor: theme.primaryBg, borderColor: theme.primaryLighter } }),
    }}
  >
    {label}
  </Button>
);

// ─── Status Update Dialog Component (without MUI icon) ───────────────
const StatusUpdateDialog = ({ open, complaint, onClose, onUpdate, loading }) => {
  const [selectedStatus, setSelectedStatus] = useState("Resolved");
  const [resolution, setResolution] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const newErrors = {};
    if (!resolution.trim()) {
      newErrors.resolution = "Resolution details are required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onUpdate(complaint._id, selectedStatus, resolution);
  };

  useEffect(() => {
    if (!open) {
      setResolution("");
      setSelectedStatus("Resolved");
      setErrors({});
    }
  }, [open]);

  if (!complaint) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 700, color: theme.textPrimary }}>
            Update Complaint Status
          </Typography>
          <Button
            onClick={onClose}
            size="small"
            sx={{ minWidth: 0, p: 0.5, color: theme.textMuted }}
          >
            ✕
          </Button>
        </Stack>
        <Typography variant="body2" sx={{ color: theme.textMuted, mt: 0.5 }}>
          {complaint.title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" sx={{ mb: 3, mt: 1 }}>
          <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
            Resolution Status
          </FormLabel>
          <RadioGroup
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            row
          >
            <FormControlLabel 
              value="Resolved" 
              control={<Radio />} 
              label={
                <Chip 
                  label="Resolved" 
                  size="small" 
                  sx={statusStyle("Resolved")}
                />
              }
            />
            <FormControlLabel 
              value="Rejected" 
              control={<Radio />} 
              label={
                <Chip 
                  label="Rejected" 
                  size="small" 
                  sx={statusStyle("Rejected")}
                />
              }
            />
          </RadioGroup>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Resolution Details"
          placeholder={`Please provide detailed ${selectedStatus.toLowerCase()} notes explaining the outcome...`}
          value={resolution}
          onChange={(e) => {
            setResolution(e.target.value);
            if (errors.resolution) setErrors({});
          }}
          error={!!errors.resolution}
          helperText={errors.resolution}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ color: theme.textMuted }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: selectedStatus === "Resolved" ? theme.resolvedText : theme.rejectedText,
            "&:hover": {
              bgcolor: selectedStatus === "Resolved" ? "#1B5E20" : "#B71C1C",
            },
          }}
        >
          {loading ? <CircularProgress size={24} /> : `Mark as ${selectedStatus}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────
export default function ComplaintView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [activePriority, setActivePriority] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [selectedForUpdate, setSelectedForUpdate] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await complaintApi.getAll();
      setComplaints(data || []);
    } catch (e) {
      setError("Failed to load complaints. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, resolution) => {
    setUpdating(true);
    try {
      await complaintApi.updateStatus(id, status, resolution);
      setSnackbar({
        open: true,
        message: `Complaint successfully marked as ${status.toLowerCase()}`,
        severity: "success",
      });
      setStatusUpdateOpen(false);
      setSelectedForUpdate(null);
      await fetchComplaints(); // Refresh the list
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to update complaint status",
        severity: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  // ── Derived stats ──
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  // ── Filtered list ──
  const filtered = complaints.filter((c) => {
    const matchStatus = activeStatus === "all" || c.status === activeStatus;
    const matchPriority = activePriority === "all" || c.priority === activePriority;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (c.title || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q) ||
      (c.complainantName || "").toLowerCase().includes(q) ||
      (c.category || "").toLowerCase().includes(q);
    return matchStatus && matchPriority && matchSearch;
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.offWhite }}>
      {/* ── Hero Header ─────────────────────────────────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 60%, ${theme.primaryLighter} 100%)`,
          pt: 5, pb: 6, px: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute", inset: 0,
            background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)",
          },
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={3}>
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Georgia', serif",
                  fontSize: { xs: "1.8rem", md: "2.4rem" },
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.1,
                  mb: 0.5,
                }}
              >
                Complaint Management
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", fontWeight: 300 }}>
                Track, review and resolve all incoming complaints
              </Typography>
            </Box>

            {/* Stats */}
            <Stack direction="row" gap={2}>
              {[
                { label: "Total", val: total, color: "#fff" },
                { label: "Pending", val: pending, color: "#FFD54F" },
                { label: "Resolved", val: resolved, color: "#A5D6A7" },
              ].map((s) => (
                <Box
                  key={s.label}
                  sx={{
                    textAlign: "center",
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 3,
                    px: 3, py: 1.5,
                    border: "1px solid rgba(255,255,255,0.2)",
                    minWidth: 72,
                  }}
                >
                  <Typography sx={{ fontFamily: "'Georgia', serif", fontSize: "1.8rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>
                    {loading ? "—" : s.val}
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.8px", mt: 0.5 }}>
                    {s.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ── Filters & Search ─────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mt: -2 }}>
        <Box
          sx={{
            bgcolor: theme.white,
            borderRadius: 3,
            border: `1px solid ${theme.border}`,
            boxShadow: "0 4px 20px rgba(21,101,192,0.08)",
            px: 3, py: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            alignItems: "center",
          }}
        >
          <FilterBtn label="All" active={activeStatus === "all"} onClick={() => setActiveStatus("all")} />
          <FilterBtn label="Pending" active={activeStatus === "Pending"} onClick={() => setActiveStatus("Pending")} color={theme.pendingText} />
          <FilterBtn label="Resolved" active={activeStatus === "Resolved"} onClick={() => setActiveStatus("Resolved")} color={theme.resolvedText} />
          <FilterBtn label="Rejected" active={activeStatus === "Rejected"} onClick={() => setActiveStatus("Rejected")} color={theme.rejectedText} />

          <Box sx={{ width: 1, height: 24, bgcolor: theme.border, display: { xs: "none", sm: "block" } }} />

          <FilterBtn label="🔴 High" active={activePriority === "High"} onClick={() => setActivePriority(activePriority === "High" ? "all" : "High")} color={theme.highText} />
          <FilterBtn label="🟠 Medium" active={activePriority === "Medium"} onClick={() => setActivePriority(activePriority === "Medium" ? "all" : "Medium")} color={theme.mediumText} />
          <FilterBtn label="🟢 Low" active={activePriority === "Low"} onClick={() => setActivePriority(activePriority === "Low" ? "all" : "Low")} color={theme.lowText} />

          <Box sx={{ flex: 1, minWidth: 180 }}>
            <TextField
              size="small"
              placeholder="Search complaints…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Box component="span" sx={{ color: theme.textMuted, fontSize: "1rem" }}>🔍</Box></InputAdornment>,
                sx: {
                  borderRadius: 2,
                  bgcolor: theme.offWhite,
                  fontSize: "0.82rem",
                  "& fieldset": { borderColor: theme.border },
                  "&:hover fieldset": { borderColor: theme.primaryLighter },
                  "&.Mui-focused fieldset": { borderColor: theme.primary },
                },
              }}
              fullWidth
            />
          </Box>

          <Button
            onClick={fetchComplaints}
            size="small"
            startIcon={<Box component="span" sx={{ fontSize: "0.9rem" }}>↺</Box>}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              color: theme.primary,
              border: `1px solid ${theme.border}`,
              px: 2, fontSize: "0.8rem",
              "&:hover": { bgcolor: theme.primaryBg },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Container>

      {/* ── Card Grid ─────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mt: 3, pb: 6 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={3}>
            {Array(6).fill(0).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10, color: theme.textMuted }}>
            <Typography sx={{ fontSize: "3rem", mb: 2 }}>📭</Typography>
            <Typography sx={{ fontFamily: "'Georgia', serif", fontSize: "1.3rem", color: theme.textPrimary, mb: 1 }}>
              No complaints found
            </Typography>
            <Typography sx={{ fontSize: "0.85rem" }}>Try adjusting your filters or search query.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((c, i) => {
              const isAnon = !c.complainantName || !c.complainantName.trim();
              return (
                <Grid item xs={12} sm={6} md={4} key={c._id}>
                  <Card
                    onClick={() => setSelected(c)}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${theme.border}`,
                      boxShadow: "0 2px 12px rgba(21,101,192,0.06)",
                      cursor: "pointer",
                      overflow: "hidden",
                      bgcolor: theme.white,
                      transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                      animation: `fadeUp 0.35s ease both`,
                      animationDelay: `${i * 0.05}s`,
                      "@keyframes fadeUp": {
                        from: { opacity: 0, transform: "translateY(10px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: `0 8px 32px rgba(21,101,192,0.14)`,
                        borderColor: theme.primaryLighter,
                      },
                    }}
                  >
                    {/* Priority bar */}
                    <Box sx={{ height: 4, bgcolor: priorityBarColor(c.priority) }} />

                    <CardContent sx={{ p: 2.5 }}>
                      {/* Title + status */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: theme.textPrimary, lineHeight: 1.3, flex: 1 }}>
                          {c.title || "Untitled"}
                        </Typography>
                        <Chip
                          label={c.status}
                          size="small"
                          sx={{
                            ...statusStyle(c.status),
                            border: `1px solid`,
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            letterSpacing: "0.4px",
                            height: 22,
                            flexShrink: 0,
                          }}
                        />
                      </Stack>

                      {/* Description */}
                      <Typography
                        sx={{
                          color: theme.textSecondary,
                          fontSize: "0.8rem",
                          lineHeight: 1.5,
                          mb: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {c.description || "No description provided."}
                      </Typography>

                      {/* Tags */}
                      <Stack direction="row" gap={0.8} mb={2} flexWrap="wrap">
                        <Chip
                          label={c.category || "General"}
                          size="small"
                          sx={{ bgcolor: theme.primaryBg, color: theme.primary, fontWeight: 600, fontSize: "0.68rem", height: 20, border: `1px solid ${theme.primaryBgDeep}` }}
                        />
                        <Chip
                          label={`▲ ${c.priority}`}
                          size="small"
                          sx={{ ...priorityStyle(c.priority), fontWeight: 700, fontSize: "0.68rem", height: 20 }}
                        />
                      </Stack>

                      <Divider sx={{ borderColor: theme.border, mb: 2 }} />

                      {/* Complainant footer */}
                      <Stack direction="row" alignItems="center" gap={1.2}>
                        <Avatar
                          sx={{
                            width: 32, height: 32,
                            bgcolor: theme.primary,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(c.complainantName)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              color: isAnon ? theme.textMuted : theme.textPrimary,
                              fontStyle: isAnon ? "italic" : "normal",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {isAnon ? "Anonymous" : c.complainantName}
                          </Typography>
                          <Typography sx={{ fontSize: "0.68rem", color: theme.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {c.complainantEmail || c.complainantPhone || "No contact info"}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: "0.67rem", color: theme.textMuted, flexShrink: 0 }}>
                          {formatDate(c.createdAt)}
                        </Typography>
                      </Stack>

                      {/* Update Status Button - Only show for pending complaints */}
                      {c.status === "Pending" && (
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedForUpdate(c);
                            setStatusUpdateOpen(true);
                          }}
                          sx={{
                            mt: 2,
                            borderRadius: 2,
                            textTransform: "none",
                            borderColor: theme.primary,
                            color: theme.primary,
                            "&:hover": {
                              bgcolor: theme.primaryBg,
                              borderColor: theme.primaryLight,
                            },
                          }}
                        >
                          ✏️ Update Status
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* ── Detail Dialog ─────────────────────────────────────── */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(21,101,192,0.18)",
          },
        }}
      >
        {selected && (
          <>
            {/* Dialog header */}
            <Box sx={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryLight})`, px: 3, py: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                <Box>
                  <Typography sx={{ fontFamily: "'Georgia', serif", fontSize: "1.25rem", fontWeight: 700, color: "#fff", lineHeight: 1.2, mb: 1 }}>
                    {selected.title || "Untitled Complaint"}
                  </Typography>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    <Chip label={selected.status} size="small" sx={{ ...statusStyle(selected.status), fontWeight: 700, fontSize: "0.65rem", height: 22, border: "1px solid" }} />
                    <Chip label={`▲ ${selected.priority}`} size="small" sx={{ ...priorityStyle(selected.priority), fontWeight: 700, fontSize: "0.65rem", height: 22 }} />
                    <Chip label={selected.category} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 600, fontSize: "0.65rem", height: 22 }} />
                  </Stack>
                </Box>
                {selected.status === "Pending" && (
                  <Button
                    variant="contained"
                    onClick={() => {
                      setSelected(null);
                      setSelectedForUpdate(selected);
                      setStatusUpdateOpen(true);
                    }}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                      textTransform: "none",
                    }}
                  >
                    Update Status
                  </Button>
                )}
              </Stack>
            </Box>

            <DialogContent sx={{ px: 3, py: 3, bgcolor: theme.white }}>
              {/* Description */}
              <Box sx={{ bgcolor: theme.offWhite, borderRadius: 2, p: 2, mb: 3, border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.8px", color: theme.textMuted, fontWeight: 600, mb: 1 }}>
                  Description
                </Typography>
                <Typography sx={{ fontSize: "0.88rem", color: theme.textPrimary, lineHeight: 1.6 }}>
                  {selected.description || "—"}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: theme.border, mb: 3 }} />

              {/* Complainant details */}
              <Typography sx={{ fontFamily: "'Georgia', serif", fontSize: "0.95rem", fontWeight: 700, color: theme.textPrimary, mb: 2 }}>
                Complainant Details
              </Typography>

              <DetailRow icon="👤" label="Name" value={selected.complainantName || "Anonymous"} />
              <DetailRow icon="✉️" label="Email" value={selected.complainantEmail} />
              <DetailRow icon="📞" label="Phone" value={selected.complainantPhone} />

              <Divider sx={{ borderColor: theme.border, mb: 3, mt: 1 }} />

              <Typography sx={{ fontFamily: "'Georgia', serif", fontSize: "0.95rem", fontWeight: 700, color: theme.textPrimary, mb: 2 }}>
                Complaint Info
              </Typography>

              <DetailRow icon="🏷️" label="Category" value={selected.category} />
              <DetailRow icon="⚡" label="Priority" value={selected.priority} />
              <DetailRow icon="📅" label="Created" value={formatDate(selected.createdAt)} />
              <DetailRow icon="🔄" label="Last Updated" value={formatDate(selected.updatedAt)} />

              {selected.resolvedAt && (
                <DetailRow icon="✅" label="Resolved/Rejected On" value={formatDate(selected.resolvedAt)} />
              )}

              {selected.adminNotes && (
                <>
                  <Divider sx={{ borderColor: theme.border, mb: 3, mt: 1 }} />
                  <DetailRow icon="📝" label="Admin Notes" value={selected.adminNotes} />
                </>
              )}

              {selected.resolution && (
                <>
                  <Divider sx={{ borderColor: theme.border, mb: 3, mt: 1 }} />
                  <DetailRow icon="💬" label="Resolution Details" value={selected.resolution} />
                </>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, bgcolor: theme.offWhite, borderTop: `1px solid ${theme.border}` }}>
              <Button
                onClick={() => setSelected(null)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  color: theme.primary,
                  fontWeight: 600,
                  border: `1px solid ${theme.border}`,
                  px: 3,
                  "&:hover": { bgcolor: theme.primaryBg },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Status Update Dialog */}
      <StatusUpdateDialog
        open={statusUpdateOpen}
        complaint={selectedForUpdate}
        onClose={() => {
          setStatusUpdateOpen(false);
          setSelectedForUpdate(null);
        }}
        onUpdate={handleStatusUpdate}
        loading={updating}
      />

      {/* ── Snackbar ───────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}