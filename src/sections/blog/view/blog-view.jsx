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

// 🔥 GET TOKEN (IMPORTANT)
const getToken = () => localStorage.getItem("token");

// 🔥 Coupon API
const couponApi = {
  getAll: async () => {
    const res = await fetch(API_BASE_URL, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    const data = await res.json();
    return data.data;
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`, // 🔥 required
      },
      body: JSON.stringify(data),
    });
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

  const [applyCode, setApplyCode] = useState("");
  const [applyResult, setApplyResult] = useState(null);

  // 🔥 Fetch Coupons
  const fetchCoupons = async () => {
    try {
      const data = await couponApi.getAll();
      setCoupons(data || []);
    } catch (err) {
      showSnackbar("Failed to fetch coupons", "error");
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

    try {
      const res = await couponApi.create(form);

      if (res.success) {
        showSnackbar("Coupon Created");
        setOpen(false);
        setForm(defaultForm);
        fetchCoupons();
      } else {
        showSnackbar(res.message || "Error creating coupon", "error");
      }
    } catch (err) {
      showSnackbar("Server error", "error");
    }
  };

  // 🔥 APPLY COUPON
  const handleApply = async () => {
    if (!applyCode) return showSnackbar("Enter coupon code", "error");

    try {
      const res = await couponApi.apply({ code: applyCode, cartTotal: 1000 });

      if (res.success) {
        setApplyResult(res.data);
        showSnackbar("Coupon Applied");
      } else {
        showSnackbar(res.message, "error");
      }
    } catch (err) {
      showSnackbar("Error applying coupon", "error");
    }
  };

  return (
    <Container>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Typography variant="h4">Coupon Management</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Create Coupon
        </Button>
      </Stack>

      {/* APPLY COUPON */}
      <Stack direction="row" spacing={2} mb={4}>
        <TextField
          label="Apply Coupon"
          value={applyCode}
          onChange={(e) => setApplyCode(e.target.value)}
        />
        <Button variant="contained" onClick={handleApply}>
          Apply
        </Button>
      </Stack>

      {applyResult && (
        <Typography color="green" mb={2}>
          Discount: ₹{applyResult.discount}
        </Typography>
      )}

      {/* COUPON LIST */}
      <Grid container spacing={3}>
        {coupons.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{c.code}</Typography>

                <Chip label={c.discountType} color="primary" size="small" />

                <Typography>
                  Discount: {c.discountValue}
                  {c.discountType === "PERCENTAGE" ? "%" : "₹"}
                </Typography>

                <Typography variant="body2">
                  Min Order: ₹{c.minOrderAmount || 0}
                </Typography>

                <Typography variant="body2">
                  Valid: {new Date(c.validFrom).toLocaleDateString()} -{" "}
                  {new Date(c.validTill).toLocaleDateString()}
                </Typography>

                <Typography variant="caption">
                  Used: {c.usedCount}/{c.usageLimit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CREATE DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Create Coupon</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Coupon Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              fullWidth
            />

            <Button
              variant="outlined"
              onClick={() =>
                setForm({ ...form, code: generateCouponCode() })
              }
            >
              Generate Code
            </Button>

            <FormControl fullWidth>
              <InputLabel>Discount Type</InputLabel>
              <Select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
              >
                <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                <MenuItem value="FIXED">Fixed</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Discount Value"
              name="discountValue"
              type="number"
              value={form.discountValue}
              onChange={handleChange}
            />

            <TextField
              label="Min Order Amount"
              name="minOrderAmount"
              type="number"
              value={form.minOrderAmount}
              onChange={handleChange}
            />

            <TextField
              label="Max Discount"
              name="maxDiscountAmount"
              type="number"
              value={form.maxDiscountAmount}
              onChange={handleChange}
            />

            <TextField
              label="Usage Limit"
              name="usageLimit"
              type="number"
              value={form.usageLimit}
              onChange={handleChange}
            />

            <TextField
              label="Valid From"
              type="date"
              name="validFrom"
              InputLabelProps={{ shrink: true }}
              value={form.validFrom}
              onChange={handleChange}
            />

            <TextField
              label="Valid Till"
              type="date"
              name="validTill"
              InputLabelProps={{ shrink: true }}
              value={form.validTill}
              onChange={handleChange}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}