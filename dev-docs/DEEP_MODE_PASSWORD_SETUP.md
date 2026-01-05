# Deep Mode Password Setup Guide

## Overview
Deep Mode is password-protected to prevent accidental high API usage. The password is stored securely in configuration properties (not in source code).

## Setup Instructions

### For Google Sheets (Apps Script)

1. **Open your Google Apps Script project**
   - Go to your Google Sheet
   - Click **Extensions** → **Apps Script**

2. **Navigate to Project Settings**
   - Click the **⚙️ Settings** icon in the left sidebar
   - Scroll down to **Script Properties**

3. **Add the Deep Mode Password**
   - Click **Add script property**
   - **Property**: `DEEP_MODE_PASSWORD`
   - **Value**: Your desired password (e.g., `mySecurePassword123`)
   - Click **Save script property**

4. **Deploy your changes**
   - After adding the property, redeploy your Apps Script
   - The password will now be used for Deep Mode validation

### For Web App (React)

1. **Create or update your `.env` file**
   - Copy `.env.example` to `.env` if it doesn't exist:
     ```bash
     cp .env.example .env
     ```

2. **Set the Deep Mode Password**
   - Open `.env` in your editor
   - Update the `VITE_DEEP_MODE_PASSWORD` variable:
     ```
     VITE_DEEP_MODE_PASSWORD=mySecurePassword123
     ```
   - **Important**: Use the **same password** as in Google Apps Script

3. **Restart your development server**
   - Stop the dev server (Ctrl+C)
   - Start it again:
     ```bash
     npm run dev
     ```

## Security Notes

### ✅ Good Practices
- Use a strong, unique password
- Don't commit `.env` to version control (already in `.gitignore`)
- Change the password periodically
- Use different passwords for dev/staging/production environments

### ⚠️ Important Limitations
- **Client-side validation**: The web app validates passwords in the browser
- **Not enterprise-grade**: Determined users can bypass client-side checks
- **Suitable for personal use**: Perfect for preventing accidental Deep Mode usage
- **Script Properties are encrypted**: Google Apps Script properties are stored securely

### 🔒 For Enterprise Security
If you need stronger security:
- Implement server-side password validation
- Use OAuth or API key authentication
- Add rate limiting and usage tracking
- Consider role-based access control (RBAC)

## Testing

### Test Google Sheets
1. Open your Google Sheet
2. Click **REI Tools** → **🏡 Open REI Assistant**
3. Select **🚀 Deep Mode** from the dropdown
4. Enter your password when prompted
5. ✅ Correct password → Deep Mode activates
6. ❌ Incorrect password → Error message, reverts to previous mode

### Test Web App (when implemented)
1. Open the web app in your browser
2. Select **🚀 Deep Mode** radio button
3. Enter your password in the modal
4. ✅ Correct password → Deep Mode activates
5. ❌ Incorrect password → Error message, stays on current mode

## Troubleshooting

### "Password not configured" error
- **Cause**: `DEEP_MODE_PASSWORD` not set in Script Properties
- **Solution**: Follow setup instructions above to add the property

### Password not working
- **Cause**: Password mismatch between Google Sheets and Web App
- **Solution**: Ensure both use the **exact same password** (case-sensitive)

### Can't find Script Properties
- **Location**: Apps Script Editor → ⚙️ Settings (left sidebar) → Script Properties section
- **Alternative**: Use `PropertiesService.getScriptProperties()` in code

## Changing Your Password

### Google Sheets
1. Go to Apps Script → ⚙️ Settings → Script Properties
2. Find `DEEP_MODE_PASSWORD`
3. Click **Edit** (pencil icon)
4. Enter new password
5. Click **Save**

### Web App
1. Open `.env` file
2. Update `VITE_DEEP_MODE_PASSWORD=new_password_here`
3. Restart dev server

## API Usage by Mode

| Mode | API Calls | Monthly Capacity | Password Required |
|------|-----------|------------------|-------------------|
| ⚡ Basic | 0-1 | Unlimited | ❌ No |
| ⭐ Standard | 2-4 | 300-600 properties | ❌ No |
| 🚀 Deep | 8-12 | 100-200 properties | ✅ **Yes** |

## Support

If you encounter issues:
1. Check that password is set in both locations
2. Verify password is exactly the same (case-sensitive)
3. Restart Apps Script and web app after changes
4. Check browser console for error messages
5. Review Apps Script logs (View → Logs)

---

**Last Updated**: Phase 2.5 - Deep Mode Password Protection
