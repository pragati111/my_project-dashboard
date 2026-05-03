/* eslint-disable */
import { useState, useEffect } from "react";
import {
  Container,
  Stack,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
} from "@mui/material";

const API_BASE_URL = "https://my-project-backend-ee4t.onrender.com/api/offercode";

// 🔥 Coupon API (No authentication required)
const couponApi = {
  getAll: async () => {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data.data || data;
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },

  apply: async (data) => {
    const res = await fetch(`${API_BASE_URL}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
};

// 🔥 Coupon Generator
const generateCouponCode = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const defaultForm = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  usageLimit: 1,
  validFrom: "",
  validTill: "",
};

export default function CouponView() {
  const [coupons, setCoupons] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);
  const [applyCode, setApplyCode] = useState("");
  const [applyResult, setApplyResult] = useState(null);

  // 🔥 Fetch Coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponApi.getAll();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      showSnackbar(err.message || "Failed to fetch coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 CREATE COUPON
  const handleCreate = async () => {
    if (!form.code || !form.discountValue || !form.validFrom || !form.validTill) {
      return showSnackbar("Fill all required fields", "error");
    }

    setLoading(true);
    try {
      const res = await couponApi.create(form);

      if (res.success) {
        showSnackbar("Coupon Created Successfully");
        setOpen(false);
        setForm(defaultForm);
        fetchCoupons();
      } else {
        showSnackbar(res.message || "Error creating coupon", "error");
      }
    } catch (err) {
      console.error("Create error:", err);
      showSnackbar(err.message || "Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 APPLY COUPON
  const handleApply = async () => {
    if (!applyCode) return showSnackbar("Enter coupon code", "error");

    setLoading(true);
    try {
      const res = await couponApi.apply({ 
        code: applyCode, 
        cartTotal: 1000 
      });

      if (res.success) {
        setApplyResult(res.data);
        showSnackbar("Coupon Applied Successfully");
      } else {
        showSnackbar(res.message || "Failed to apply coupon", "error");
        setApplyResult(null);
      }
    } catch (err) {
      console.error("Apply error:", err);
      showSnackbar(err.message || "Error applying coupon", "error");
      setApplyResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Typography variant="h4">Coupon Management</Typography>
        <Button variant="contained" onClick={() => setOpen(true)} disabled={loading}>
          Create Coupon
        </Button>
      </Stack>

      {/* APPLY COUPON */}
      <Stack direction="row" spacing={2} mb={4}>
        <TextField
          label="Apply Coupon"
          value={applyCode}
          onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
          disabled={loading}
          fullWidth
        />
        <Button variant="contained" onClick={handleApply} disabled={loading}>
          Apply
        </Button>
      </Stack>

      {applyResult && (
        <Typography color="green" mb={2}>
          Discount: ₹{applyResult.discount}
        </Typography>
      )}

      {/* COUPON LIST */}
      {loading && !coupons.length ? (
        <Typography>Loading coupons...</Typography>
      ) : (
        <Grid container spacing={3}>
          {coupons.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No coupons available</Typography>
            </Grid>
          ) : (
            coupons.map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{c.code}</Typography>

                    <Chip 
                      label={c.discountType} 
                      color={c.discountType === "PERCENTAGE" ? "primary" : "secondary"} 
                      size="small" 
                      sx={{ my: 1 }}
                    />

                    <Typography>
                      Discount: {c.discountValue}
                      {c.discountType === "PERCENTAGE" ? "%" : "₹"}
                    </Typography>

                    <Typography variant="body2">
                      Min Order: ₹{c.minOrderAmount || 0}
                    </Typography>

                    {c.maxDiscountAmount && (
                      <Typography variant="body2">
                        Max Discount: ₹{c.maxDiscountAmount}
                      </Typography>
                    )}

                    <Typography variant="body2">
                      Valid: {new Date(c.validFrom).toLocaleDateString()} -{" "}
                      {new Date(c.validTill).toLocaleDateString()}
                    </Typography>

                    <Typography variant="caption" color="textSecondary">
                      Used: {c.usedCount || 0}/{c.usageLimit || 1}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={open} onClose={() => !loading && setOpen(false)} fullWidth>
        <DialogTitle>Create Coupon</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Coupon Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              fullWidth
              helperText="Enter unique coupon code"
            />

            <Button
              variant="outlined"
              onClick={() =>
                setForm({ ...form, code: generateCouponCode() })
              }
              disabled={loading}
            >
              Generate Random Code
            </Button>

            <FormControl fullWidth>
              <InputLabel>Discount Type</InputLabel>
              <Select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                label="Discount Type"
              >
                <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                <MenuItem value="FIXED">Fixed Amount (₹)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Discount Value"
              name="discountValue"
              type="number"
              value={form.discountValue}
              onChange={handleChange}
              required
              helperText={form.discountType === "PERCENTAGE" ? "Enter percentage (e.g., 10 for 10%)" : "Enter fixed amount in rupees"}
            />

            <TextField
              label="Min Order Amount"
              name="minOrderAmount"
              type="number"
              value={form.minOrderAmount}
              onChange={handleChange}
              helperText="Minimum cart value required (optional)"
            />

            <TextField
              label="Max Discount Amount"
              name="maxDiscountAmount"
              type="number"
              value={form.maxDiscountAmount}
              onChange={handleChange}
              helperText="Maximum discount limit (optional, for percentage discounts)"
            />

            <TextField
              label="Usage Limit"
              name="usageLimit"
              type="number"
              value={form.usageLimit}
              onChange={handleChange}
              helperText="How many times can this coupon be used?"
            />

            <TextField
              label="Valid From"
              type="date"
              name="validFrom"
              InputLabelProps={{ shrink: true }}
              value={form.validFrom}
              onChange={handleChange}
              required
            />

            <TextField
              label="Valid Till"
              type="date"
              name="validTill"
              InputLabelProps={{ shrink: true }}
              value={form.validTill}
              onChange={handleChange}
              required
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}