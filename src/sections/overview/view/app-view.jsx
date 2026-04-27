/* eslint-disable no-unused-vars */
/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
// eslint-disable-next-line perfectionist/sort-imports
import { faker } from "@faker-js/faker";
// eslint-disable-next-line perfectionist/sort-imports
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import {
  Card,
  Table,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Chip,
} from "@mui/material";
// eslint-disable-next-line perfectionist/sort-imports
import { analyticsService } from "src/services/ApiService";
// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-imports, perfectionist/sort-imports
import AppOrderTimeline from "../app-order-timeline";
import AppCurrentVisits from "../app-current-visits";
import AppWebsiteVisits from "../app-website-visits";
import AppWidgetSummary from "../app-widget-summary";
import AppCurrentSubject from "../app-current-subject";

// ----------------------------------------------------------------------

export default function AppView() {
  const [counts, setCounts] = useState({
    categories: 0,
    subcategories: 0,
    products: 0,
  });

  const [visitorStats, setVisitorStats] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    activeUsers: 0,
    returningVisitors: 0,
    newVisitors: 0,
    weeklyData: [],
    monthlyData: []
  });

  const [salesHistory, setSalesHistory] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    salesByMonth: [],
    topProducts: [],
    salesGrowth: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await analyticsService.getAnalyticsCounts();
        setCounts(data);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };
    
    const fetchVisitorStats = () => {
      // Generate visitor statistics
      const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyVisitors = weeklyLabels.map(() => faker.number.int({ min: 500, max: 2500 }));
      const monthlyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const monthlyVisitors = monthlyLabels.map(() => faker.number.int({ min: 8000, max: 15000 }));
      
      setVisitorStats({
        totalVisitors: faker.number.int({ min: 50000, max: 150000 }),
        todayVisitors: faker.number.int({ min: 800, max: 3500 }),
        activeUsers: faker.number.int({ min: 120, max: 450 }),
        returningVisitors: faker.number.int({ min: 15000, max: 45000 }),
        newVisitors: faker.number.int({ min: 10000, max: 35000 }),
        weeklyData: weeklyVisitors,
        monthlyData: monthlyVisitors
      });
    };
    
    const fetchSalesHistory = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const salesByMonth = months.map((month) => ({
        month,
        sales: faker.number.int({ min: 50000, max: 200000 }),
        revenue: faker.number.int({ min: 500000, max: 2500000 }),
        orders: faker.number.int({ min: 1000, max: 8000 })
      }));
      
      const topProducts = [
        { name: "Fresh Apples (1kg)", sales: 12500, revenue: 1249990, growth: 15 },
        { name: "Organic Milk (1L)", sales: 10800, revenue: 539980, growth: 22 },
        { name: "Basmati Rice (5kg)", sales: 8900, revenue: 979980, growth: 8 },
        { name: "Whole Wheat Bread", sales: 7600, revenue: 379980, growth: 12 },
        { name: "Premium Tea (250g)", sales: 6700, revenue: 669990, growth: 18 }
      ];
      
      const totalRevenue = salesByMonth.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = salesByMonth.reduce((sum, item) => sum + item.orders, 0);
      
      setSalesHistory({
        totalSales: totalOrders,
        totalRevenue,
        averageOrderValue: Math.round(totalRevenue / totalOrders),
        salesByMonth,
        topProducts,
        salesGrowth: faker.number.int({ min: 5, max: 35 })
      });
    };
    
    fetchCounts();
    fetchVisitorStats();
    fetchSalesHistory();
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        {/* Category Count */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Categories"
            total={counts.categories}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        {/* Subcategory Count */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Subcategories"
            total={counts.subcategories}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        {/* Product Count */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Products"
            total={counts.products}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        {/* Total Visitors */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Visitors"
            total={visitorStats.totalVisitors}
            color="primary"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        {/* Today's Visitors */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Today's Visitors"
            total={visitorStats.todayVisitors}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        {/* Active Users */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Active Users Now"
            total={visitorStats.activeUsers}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        {/* Total Revenue */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Revenue"
            total={`₹${(salesHistory.totalRevenue / 10000000).toFixed(1)}Cr`}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

         <Grid item xs={12} sm={6} md={3}>
  <AppWidgetSummary
    title="Top 10 Customers"
    total={10}
    color="success"
    icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
  />
</Grid>
        {/* Total Sales */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Orders"
            total={salesHistory.totalSales}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        {/* Average Order Value */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Avg Order Value"
            total={`₹${(salesHistory.averageOrderValue / 1000).toFixed(1)}k`}
            color="primary"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        {/* Sales Growth */}
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Sales Growth (YoY)"
            total={`+${salesHistory.salesGrowth}%`}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        {/* Visitor Analytics - Weekly */}
        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Visitor Analytics (Last 7 Days)"
            subheader="Daily unique visitors to the platform"
            chart={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [
                {
                  name: "Visitors",
                  type: "column",
                  fill: "solid",
                  data: visitorStats.weeklyData,
                },
                {
                  name: "Returning Visitors",
                  type: "line",
                  fill: "solid",
                  data: visitorStats.weeklyData.map(v => Math.floor(v * 0.6)),
                },
              ],
            }}
          />
        </Grid>

        {/* Visitor Breakdown */}
        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Visitor Breakdown"
            chart={{
              series: [
                { label: "New Visitors", value: visitorStats.newVisitors },
                { label: "Returning Visitors", value: visitorStats.returningVisitors },
                { label: "Active Users", value: visitorStats.activeUsers * 10 },
              ],
            }}
          />
        </Grid>

        {/* Sales History - Monthly */}
        <Grid xs={12} md={6} lg={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Sales History (₹ in Lakhs)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Month</strong></TableCell>
                    <TableCell align="right"><strong>Orders</strong></TableCell>
                    <TableCell align="right"><strong>Revenue (₹)</strong></TableCell>
                    <TableCell align="right"><strong>Growth</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesHistory.salesByMonth.slice(-6).map((item, index, array) => {
                    const prevMonth = index > 0 ? array[index - 1] : null;
                    const growth = prevMonth ? ((item.revenue - prevMonth.revenue) / prevMonth.revenue * 100).toFixed(1) : 0;
                    return (
                      <TableRow key={item.month}>
                        <TableCell>{item.month}</TableCell>
                        <TableCell align="right">{item.orders.toLocaleString()}</TableCell>
                        <TableCell align="right">₹{(item.revenue / 100000).toFixed(1)}L</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${growth > 0 ? '+' : ''}${growth}%`} 
                            size="small" 
                            color={growth > 0 ? "success" : "error"}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Monthly Sales Overview */}
        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Sales History Overview (2024)"
            subheader={`${salesHistory.salesGrowth}% growth in sales compared to last year`}
            chart={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              series: [
                {
                  name: "Revenue (₹ Lakhs)",
                  type: "column",
                  fill: "solid",
                  data: salesHistory.salesByMonth.map(item => item.revenue / 100000),
                },
                {
                  name: "Orders (Hundreds)",
                  type: "line",
                  fill: "solid",
                  data: salesHistory.salesByMonth.map(item => item.orders / 100),
                },
              ],
            }}
          />
        </Grid>

        {/* Order Distribution by Region */}
        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Order Distribution by Indian Region"
            chart={{
              series: [
                { label: "North India (Delhi, Punjab, UP)", value: 6200 },
                { label: "South India (Bangalore, Chennai, Hyderabad)", value: 7800 },
                { label: "West India (Mumbai, Pune, Gujarat)", value: 6900 },
                { label: "East India (Kolkata, Odisha, Assam)", value: 3600 },
              ],
            }}
          />
        </Grid>

        {/* Customer Behavior */}
        <Grid xs={12} md={6} lg={4}>
          <AppCurrentSubject
            title="Customer Behavior"
            chart={{
              categories: ['Mobile App', 'Website', 'Repeat Rate', 'Avg Cart', 'Retention', 'Churn'],
              series: [
                {
                  name: "Quick Commerce",
                  data: [85, 35, 78, 92, 88, 12],
                },
                {
                  name: "E-commerce",
                  data: [65, 48, 65, 84, 80, 20],
                },
                {
                  name: "Overall (India)",
                  data: [75, 41, 71, 88, 84, 16],
                },
              ],
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}