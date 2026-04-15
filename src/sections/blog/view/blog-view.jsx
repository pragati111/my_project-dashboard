/* eslint-disable perfectionist/sort-imports */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line perfectionist/sort-imports
import axios from 'axios';
// eslint-disable-next-line perfectionist/sort-imports
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// eslint-disable-next-line perfectionist/sort-imports
import TextField from '@mui/material/TextField';
// eslint-disable-next-line perfectionist/sort-imports
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
// eslint-disable-next-line perfectionist/sort-imports
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
// eslint-disable-next-line perfectionist/sort-imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
// eslint-disable-next-line perfectionist/sort-imports
import Chip from '@mui/material/Chip';
// eslint-disable-next-line perfectionist/sort-imports
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
// eslint-disable-next-line perfectionist/sort-imports
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';

import Iconify from 'src/components/iconify';
// eslint-disable-next-line perfectionist/sort-imports
import PostSort from '../post-sort';
import PostSearch from '../post-search';

// Cloudinary configuration
const CLOUDINARY_UPLOAD_PRESET = "market_data";
const CLOUDINARY_CLOUD_NAME = "drq4o4qix";

// API service functions
const API_BASE_URL = 'http://localhost:8000/api/complaints';

const COMPLAINT_STATUSES = ['Pending', 'In Review', 'Resolved', 'Rejected'];
const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const COMPLAINT_CATEGORIES = [
  'Product Quality',
  'Delivery Issue',
  'Customer Service',
  'Billing / Payment',
  'Technical Issue',
  'Other',
];

const STATUS_COLORS = {
  Pending: 'warning',
  'In Review': 'info',
  Resolved: 'success',
  Rejected: 'error',
};

const PRIORITY_COLORS = {
  Low: 'default',
  Medium: 'warning',
  High: 'error',
  Urgent: 'error',
};

const complaintApi = {
  getAll: async () => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch complaints');
    const data = await response.json();
    return data.data;
  },

  getOne: async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch complaint');
    return response.json();
  },

  create: async (complaintData) => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData),
    });
    if (!response.ok) throw new Error('Failed to create complaint');
    return response.json();
  },

  update: async (id, complaintData) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData),
    });
    if (!response.ok) throw new Error('Failed to update complaint');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete complaint');
    return response.json();
  },
};

// Helper function to upload image/attachment to Cloudinary
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData
  );
  return res.data.secure_url;
};

const defaultFormData = {
  title: '',
  description: '',
  category: '',
  priority: 'Medium',
  status: 'Pending',
  complainantName: '',
  complainantEmail: '',
  complainantPhone: '',
  attachments: [],
  adminNotes: '',
  resolution: '',
};

export default function ComplaintView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [viewComplaint, setViewComplaint] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterStatus, setFilterStatus] = useState('All');

  const [formData, setFormData] = useState(defaultFormData);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await complaintApi.getAll();
      setComplaints(data);
    } catch (error) {
      showSnackbar('Failed to fetch complaints', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (complaint = null) => {
    if (complaint) {
      setEditingComplaint(complaint);
      setFormData({
        title: complaint.title || '',
        description: complaint.description || '',
        category: complaint.category || '',
        priority: complaint.priority || 'Medium',
        status: complaint.status || 'Pending',
        complainantName: complaint.complainantName || '',
        complainantEmail: complaint.complainantEmail || '',
        complainantPhone: complaint.complainantPhone || '',
        attachments: complaint.attachments || [],
        adminNotes: complaint.adminNotes || '',
        resolution: complaint.resolution || '',
      });
    } else {
      setEditingComplaint(null);
      setFormData(defaultFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingComplaint(null);
  };

  const handleOpenViewDialog = (complaint) => {
    setViewComplaint(complaint);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewComplaint(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, { name: file.name, url }],
      }));
      showSnackbar('Attachment uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      showSnackbar('Failed to upload attachment', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      showSnackbar('Title, description and category are required', 'error');
      return;
    }
    try {
      if (editingComplaint) {
        await complaintApi.update(editingComplaint._id, formData);
        showSnackbar('Complaint updated successfully');
      } else {
        await complaintApi.create(formData);
        showSnackbar('Complaint created successfully');
      }
      handleCloseDialog();
      fetchComplaints();
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  const handleDelete = async (complaint) => {
    if (window.confirm(`Are you sure you want to delete complaint "${complaint.title}"?`)) {
      try {
        await complaintApi.delete(complaint._id);
        showSnackbar('Complaint deleted successfully');
        fetchComplaints();
      } catch (error) {
        showSnackbar(error.message, 'error');
      }
    }
  };

  const handleQuickStatusChange = async (complaint, newStatus) => {
    try {
      await complaintApi.update(complaint._id, { ...complaint, status: newStatus });
      showSnackbar(`Status updated to "${newStatus}"`);
      fetchComplaints();
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  // Filter and sort
  const filteredComplaints = complaints
    .filter(c =>
      (filterStatus === 'All' || c.status === filterStatus) &&
      (
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.complainantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'popular') {
        const order = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Complaint Management</Typography>
          
        </Stack>

        {/* Summary Chips */}
        <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
          {['All', ...COMPLAINT_STATUSES].map((status) => (
            <Chip
              key={status}
              label={`${status}${status === 'All' ? ` (${complaints.length})` : ` (${complaints.filter(c => c.status === status).length})`}`}
              color={status === 'All' ? 'default' : STATUS_COLORS[status]}
              variant={filterStatus === status ? 'filled' : 'outlined'}
              onClick={() => setFilterStatus(status)}
              sx={{ mb: 1, cursor: 'pointer' }}
            />
          ))}
        </Stack>

        <Stack mb={5} direction="row" alignItems="center" justifyContent="space-between">
          <PostSearch
            posts={complaints}
            onSearch={setSearchTerm}
            placeholder="Search complaints..."
          />
          <PostSort
            options={[
              { value: 'latest', label: 'Latest' },
              { value: 'popular', label: 'Priority' },
              { value: 'oldest', label: 'Oldest' },
            ]}
            onSort={setSortBy}
          />
        </Stack>

        <Grid container spacing={3}>
          {filteredComplaints.map((complaint) => (
            <Grid xs={12} sm={6} md={4} key={complaint._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Chip
                      label={complaint.status || 'Pending'}
                      color={STATUS_COLORS[complaint.status] || 'default'}
                      size="small"
                    />
                    <Chip
                      label={complaint.priority || 'Medium'}
                      color={PRIORITY_COLORS[complaint.priority] || 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
                    {complaint.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category: {complaint.category || 'N/A'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                    {complaint.description}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="body2" color="text.secondary">
                    By: {complaint.complainantName || 'Anonymous'}
                  </Typography>

                  {complaint.complainantEmail && (
                    <Typography variant="body2" color="text.secondary">
                      {complaint.complainantEmail}
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.disabled">
                    {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : ''}
                  </Typography>

                  {complaint.attachments?.length > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Attachments: {complaint.attachments.length}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenViewDialog(complaint)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenDialog(complaint)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(complaint)}
                    >
                      Delete
                    </Button>
                  </Stack>

                  {/* Quick status update */}
                  {complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                      {complaint.status === 'Pending' && (
                        <Button
                          size="small"
                          color="info"
                          onClick={() => handleQuickStatusChange(complaint, 'In Review')}
                        >
                          Mark In Review
                        </Button>
                      )}
                      {(complaint.status === 'Pending' || complaint.status === 'In Review') && (
                        <>
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleQuickStatusChange(complaint, 'Resolved')}
                          >
                            Resolve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleQuickStatusChange(complaint, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredComplaints.length === 0 && (
          <Typography textAlign="center" color="text.secondary" sx={{ mt: 8 }}>
            No complaints found
          </Typography>
        )}
      </Container>

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingComplaint ? 'Edit Complaint' : 'Create New Complaint'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Complaint Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              fullWidth
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
              required
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleInputChange}
                >
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  label="Priority"
                  onChange={handleInputChange}
                >
                  {COMPLAINT_PRIORITIES.map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleInputChange}
                >
                  {COMPLAINT_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Typography variant="h6">Complainant Details</Typography>

            <TextField
              label="Full Name"
              name="complainantName"
              value={formData.complainantName}
              onChange={handleInputChange}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Email"
                name="complainantEmail"
                value={formData.complainantEmail}
                onChange={handleInputChange}
                fullWidth
                type="email"
              />
              <TextField
                label="Phone"
                name="complainantPhone"
                value={formData.complainantPhone}
                onChange={handleInputChange}
                fullWidth
              />
            </Stack>

            {/* Attachments */}
            <Typography variant="h6">Attachments</Typography>
            <Button
              component="label"
              variant="outlined"
              disabled={uploading}
              startIcon={<Iconify icon="eva:attach-2-fill" />}
            >
              {uploading ? 'Uploading...' : 'Upload Attachment'}
              <input
                type="file"
                hidden
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleAttachmentUpload}
              />
            </Button>

            {formData.attachments.map((att, index) => (
              <Stack key={index} direction="row" alignItems="center" spacing={1}>
                <Iconify icon="eva:file-fill" />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {att.name}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemoveAttachment(index)}
                >
                  Remove
                </Button>
              </Stack>
            ))}

            {/* Admin Section */}
            <Typography variant="h6">Admin Notes</Typography>
            <TextField
              label="Internal Notes"
              name="adminNotes"
              value={formData.adminNotes}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              helperText="Visible to admins only"
            />

            <TextField
              label="Resolution"
              name="resolution"
              value={formData.resolution}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              helperText="Resolution details when complaint is closed"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingComplaint ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Complaint Details</DialogTitle>
        <DialogContent>
          {viewComplaint && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={viewComplaint.status}
                  color={STATUS_COLORS[viewComplaint.status] || 'default'}
                  size="small"
                />
                <Chip
                  label={viewComplaint.priority}
                  color={PRIORITY_COLORS[viewComplaint.priority] || 'default'}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                <Typography variant="body1">{viewComplaint.title}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                <Typography variant="body1">{viewComplaint.category}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body2">{viewComplaint.description}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Complainant</Typography>
                <Typography variant="body1">{viewComplaint.complainantName || 'Anonymous'}</Typography>
                {viewComplaint.complainantEmail && (
                  <Typography variant="body2" color="text.secondary">{viewComplaint.complainantEmail}</Typography>
                )}
                {viewComplaint.complainantPhone && (
                  <Typography variant="body2" color="text.secondary">{viewComplaint.complainantPhone}</Typography>
                )}
              </Box>

              {viewComplaint.attachments?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Attachments</Typography>
                  {viewComplaint.attachments.map((att, i) => (
                    <Stack key={i} direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="eva:file-fill" />
                      <Typography
                        variant="body2"
                        component="a"
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ color: 'primary.main' }}
                      >
                        {att.name}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              )}

              {viewComplaint.adminNotes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Admin Notes</Typography>
                  <Typography variant="body2">{viewComplaint.adminNotes}</Typography>
                </Box>
              )}

              {viewComplaint.resolution && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Resolution</Typography>
                  <Typography variant="body2">{viewComplaint.resolution}</Typography>
                </Box>
              )}

              <Typography variant="caption" color="text.disabled">
                Submitted: {viewComplaint.createdAt ? new Date(viewComplaint.createdAt).toLocaleString() : 'N/A'}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button
            variant="outlined"
            onClick={() => {
              handleCloseViewDialog();
              handleOpenDialog(viewComplaint);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}