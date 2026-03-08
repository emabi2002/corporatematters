# 🔐 Corporate Matters Master Login Setup

**System**: Corporate Matters Management System
**Purpose**: Default admin credentials for testing and initial setup

---

## 📋 Default Master Login Credentials

```
Email:    corporate@dlpp.gov.pg
Password: Corporate@2025
```

**Role**: System Administrator
**Access**: Full access to all Corporate Matters features

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Create User in Supabase Auth

1. Open your Supabase Dashboard
2. Go to **Authentication** → **Users**
3. Click **"Add User"** button
4. Fill in:
   - **Email**: `corporate@dlpp.gov.pg`
   - **Password**: `Corporate@2025`
   - **Auto Confirm User**: ✅ Yes
5. Click **"Create User"**
6. **Copy the User ID** (you'll need it in Step 2)

---

### Step 2: Add Profile with Admin Role

1. Go to **Table Editor** → **profiles** table
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   ```
   id:           [paste the User ID from Step 1]
   email:        corporate@dlpp.gov.pg
   full_name:    Corporate Admin
   role:         system_administrator
   department:   Legal Services
   division:     Corporate Legal
   position:     System Administrator
   phone:        +675 xxx xxxx
   is_active:    true
   ```
4. Click **"Save"**

---

### Step 3: Test Login

1. Open your Corporate Matters application
2. The login page should be pre-filled with:
   - Email: `corporate@dlpp.gov.pg`
   - Password: `Corporate@2025`
3. Click **"Sign In"**
4. You should be redirected to the Dashboard

---

## 🎯 User Roles Available

After logging in, you can create more users with different roles:

| Role | Access Level | Description |
|------|--------------|-------------|
| `system_administrator` | Full Access | All features and admin panel |
| `director_policy_legal` | Executive | User management, all matters |
| `manager_legal_services` | Management | Assign matters, review, reports |
| `senior_legal_officer_corporate` | Senior | Enhanced permissions, reviews |
| `legal_officer_corporate` | Officer | Work on assigned matters |
| `legal_secretary` | Entry | Register matters, documents |

---

## 📖 Alternative: SQL Script Method

If you prefer, run this SQL in Supabase SQL Editor:

```sql
-- Step 1: Get the user ID (after creating user in Auth)
-- Replace 'USER_ID_HERE' with the actual UUID from auth.users

-- Step 2: Insert profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  department,
  division,
  position,
  is_active,
  created_at
) VALUES (
  'USER_ID_HERE', -- Replace with actual user ID
  'corporate@dlpp.gov.pg',
  'Corporate Admin',
  'system_administrator',
  'Legal Services',
  'Corporate Legal',
  'System Administrator',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Can login with `corporate@dlpp.gov.pg`
- [ ] Redirected to Dashboard after login
- [ ] Can see all navigation menu items
- [ ] Can access Admin Panel
- [ ] Can create new matters
- [ ] Can access all features

---

## 🔧 Troubleshooting

### "Invalid login credentials"
- ✅ Make sure user exists in Supabase Auth
- ✅ Password is exactly: `Corporate@2025` (case-sensitive)
- ✅ User is confirmed (Auto Confirm enabled)

### "User profile not found"
- ✅ Make sure profile exists in `profiles` table
- ✅ User ID in `profiles` matches the ID in `auth.users`

### "Access denied" / "Not authorized"
- ✅ Check `role` field is set to `system_administrator`
- ✅ Check `is_active` is set to `true`

### Can't see Admin menu items
- ✅ Verify role is `system_administrator`
- ✅ Clear browser cache and reload
- ✅ Check browser console for errors

---

## 🎨 What You'll See After Login

### Dashboard
- Professional metric cards
- Matter statistics
- Assigned matters
- Recent activities

### Sidebar Navigation
1. **Dashboard** - Overview
2. **Matter Workflow** - Register, My Matters, Pending items
3. **Matter Register** - All, Active, Closed, Overdue
4. **Management** - Documents, Tasks, Notifications
5. **Reports & Analytics** - Reports
6. **Administration** - Admin Panel, Users, Divisions, etc.

---

## 🔐 Security Notes

### For Development/Testing
- ✅ Default credentials are pre-filled for easy testing
- ✅ Quick access during development

### For Production
⚠️ **IMPORTANT**: Before deploying to production:

1. **Remove default values** from login page:
   ```typescript
   const [email, setEmail] = useState(''); // Remove default
   const [password, setPassword] = useState(''); // Remove default
   ```

2. **Change password** for corporate@dlpp.gov.pg user

3. **Create unique admin accounts** for each administrator

4. **Enable 2FA** if available

---

## 👥 Creating Additional Users

After logging in as admin, you can create more users:

1. Go to **Administration** → **User Management**
2. Click **"Add User"** button
3. Fill in user details
4. Assign appropriate role
5. User will receive credentials

Or manually in Supabase following the same steps above.

---

## 📝 Quick Reference

**Master Login**: `corporate@dlpp.gov.pg` / `Corporate@2025`
**Role**: `system_administrator`
**Dashboard**: `/dashboard`
**Admin Panel**: `/admin`

---

## 🎯 Next Steps After Login

1. ✅ Explore the dashboard
2. ✅ Register a test matter
3. ✅ Create additional users
4. ✅ Set up divisions and matter types
5. ✅ Configure reference data
6. ✅ Test the full workflow

---

**Documentation**: See other `.same/*.md` files for detailed feature guides

🤖 Generated with [Same](https://same.new)
