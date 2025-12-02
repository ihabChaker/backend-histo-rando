# Admin Module

## Overview

The Admin Module provides comprehensive dashboard and management capabilities for the HistoRando platform.

## Features

### 📊 Dashboard Statistics
- User metrics (total, new registrations, PMR users)
- Content statistics (parcours, POIs, quizzes, challenges, rewards)
- Activity analytics (completion rates, engagement metrics)
- Growth trends and analytics

### 👥 User Management
- List all users with pagination and filtering
- View detailed user profiles with activity history
- Update user roles (promote/demote admins)
- Delete user accounts

### 📈 Analytics
- Recent activity feed
- Content distribution statistics
- User growth trends over time
- Engagement metrics

## Architecture

```
admin/
├── admin.module.ts          # Module definition
├── admin.controller.ts      # API endpoints
├── admin.service.ts         # Business logic
└── dto/
    └── update-user-role.dto.ts  # DTOs for validation
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Get dashboard statistics |
| GET | `/admin/users` | List all users (paginated) |
| GET | `/admin/users/:id` | Get user details |
| PUT | `/admin/users/:id/role` | Update user role |
| DELETE | `/admin/users/:id` | Delete user |
| GET | `/admin/activities/recent` | Get recent activities |
| GET | `/admin/stats/content` | Get content statistics |
| GET | `/admin/stats/user-growth` | Get user growth data |

## Dependencies

The module depends on the following entities:
- User
- Parcours
- Reward
- PointOfInterest
- Quiz
- Challenge
- TreasureHunt
- UserActivity
- UserPOIVisit
- UserQuizAttempt
- UserChallengeProgress
- UserTreasureFound
- UserRewardRedeemed
- Podcast

## Authorization

All endpoints require:
1. Valid JWT authentication
2. User role set to `admin`

This is enforced using:
```typescript
@UseGuards(RolesGuard)
@Roles('admin')
```

## Usage Example

```typescript
// Get dashboard stats
const stats = await adminService.getDashboardStats();

// List users with pagination
const users = await adminService.getAllUsers({
  limit: 50,
  offset: 0,
  role: 'user',
});

// Update user role
await adminService.updateUserRole(userId, 'admin');

// Get user growth for last 30 days
const growth = await adminService.getUserGrowth(30);
```

## Testing

E2E tests are available in `test/admin.e2e-spec.ts`:

```bash
npm run test:e2e admin.e2e-spec
```

Test coverage includes:
- ✅ Dashboard statistics retrieval
- ✅ User listing and pagination
- ✅ User filtering by role and PMR status
- ✅ User details retrieval
- ✅ Role updates
- ✅ User deletion
- ✅ Recent activities feed
- ✅ Content statistics
- ✅ User growth analytics
- ✅ Authorization checks (admin-only access)

## Performance Considerations

### Caching Recommendations
Consider caching the following endpoints for better performance:

1. **Dashboard Stats** - Cache for 5-15 minutes
   ```typescript
   @CacheTTL(600) // 10 minutes
   @Get('stats')
   async getStats() { ... }
   ```

2. **Content Stats** - Cache for 30-60 minutes
   ```typescript
   @CacheTTL(1800) // 30 minutes
   @Get('stats/content')
   async getContentStats() { ... }
   ```

### Database Optimization

1. **Indexes**: Ensure indexes on frequently queried fields
   - `users.registrationDate`
   - `users.role`
   - `users.isPmr`
   - `userActivities.startTime`

2. **Pagination**: Always use pagination for large datasets
   ```typescript
   limit: options?.limit || 50,
   offset: options?.offset || 0,
   ```

## Future Enhancements

### Planned Features
- [ ] Export functionality (CSV, Excel)
- [ ] Bulk operations (bulk user updates, bulk deletions)
- [ ] Advanced search and filtering
- [ ] Real-time dashboard updates via WebSocket
- [ ] Audit logging for admin actions
- [ ] Custom report generation
- [ ] Email notifications for critical events
- [ ] Data visualization endpoints for charts

### Analytics Enhancements
- [ ] User engagement scoring
- [ ] Cohort analysis
- [ ] Retention metrics
- [ ] Revenue analytics (if applicable)
- [ ] Geographic distribution
- [ ] Device/platform analytics

## Security

### Access Control
- All endpoints protected by JWT authentication
- Role-based authorization (admin only)
- Password hashes excluded from all responses

### Audit Logging (Recommended)
Consider implementing audit logs for:
- User role changes
- User deletions
- Bulk operations
- Critical system changes

### Best Practices
1. Never expose password hashes
2. Log all admin actions
3. Implement rate limiting
4. Use HTTPS in production
5. Regular security audits
6. Consider 2FA for admin accounts

## Documentation

For detailed API documentation, see:
- [Admin Dashboard Documentation](../ADMIN_DASHBOARD_DOCUMENTATION.md)
- [Swagger UI](http://localhost:3000/api/docs) (when running)

## Contributing

When adding new admin features:
1. Add service methods in `admin.service.ts`
2. Create controller endpoints in `admin.controller.ts`
3. Add DTOs for validation if needed
4. Update module imports if using new entities
5. Add E2E tests in `test/admin.e2e-spec.ts`
6. Update documentation
