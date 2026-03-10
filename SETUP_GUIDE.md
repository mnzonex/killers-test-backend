# KILLERS VIP - Full Setup & Deployment Guide

This guide provides a step-by-step walkthrough to set up the KILLERS VIP platform, including the User Management System, Dynamic Payment Routing, and the Standalone Admin Dashboard.

---

## 🇱🇰 සිංහලෙන් කියවන්න (Sinhala Version)

### 1. Supabase පසුබිම (Backend) සැකසීම
1.  [supabase.com](https://supabase.com) වෙත සෙයින්-අප් (Sign-up) වී අලුත් Project එකක් සාදන්න.
2.  **SQL Editor** වෙත ගොස්, මෙම ෆෝල්ඩරයේ ඇති `database_schema.sql` ගොනුවේ අඩංගු සියලුම කේත (Code) එහි පේස්ට් කර **Run** කරන්න.
3.  **Authentication -> Providers -> Google** වෙත ගොස්, එය Enable කරන්න. (මෙහිදී ඔබට Google Cloud Console එකෙන් ලබගත් Client ID සහ Secret එක ඇතුළත් කිරීමට සිදුවේ).
4.  ඔබගේ වෙබ් අඩවියේ URL එක (උදා: `https://killersvip.vercel.app`) Supabase හි **Site URL** එක ලෙස ලබා දෙන්න.

### 2. වෙබ් අඩවිය සම්බන්ධ කිරීම
1.  **Project Settings -> API** වෙත ගොස් `Project URL` සහ `anon key` එක ලබා ගන්න.
2.  ප්‍රධාන ෆෝල්ඩරයේ ඇති `js/supabase-config.js` සහ `admin/js/supabase-config.js` යන ගොනු දෙකේම ඇති තැන් වලට එම දත්ත ඇතුළත් කරන්න.

### 3. වෙබ් අඩවිය අන්තර්ජාලයට එක් කිරීම (Deployment)
මෙම ව්‍යාපෘතිය කොටස් දෙකකට Host කළ හැක:
*   **Main Website:** ප්‍රධාන ෆෝල්ඩරයේ ඇති ගොනු upload කරන්න. (`admin` ෆෝල්ඩරය අවශ්‍ය නැත).
*   **Admin Dashboard:** `admin` ෆෝල්ඩරය පමණක් වෙනම Domain එකකට හෝ Sub-domain එකකට upload කරන්න.

---

## 🇺🇸 English Version

### 1. Supabase Backend Setup
1.  Create a project at [supabase.com](https://supabase.com).
2.  Run the code from `database_schema.sql` in the **SQL Editor**.
3.  Enable **Google Auth** in **Authentication -> Providers**. Enter your Google Client ID/Secret.
4.  Add your website URL to the **Site URL** in Supabase settings.

### 2. Frontend Configuration
1.  Get your **Project URL** and **API Key** from Supabase Settings -> API.
2.  Update `js/supabase-config.js` AND `admin/js/supabase-config.js` with these details.

### 3. Deployment Strategy
*   **User Site:** Host the main folder (excluding the `admin` folder) on Vercel/Netlify.
*   **Admin Dashboard:** Host the `admin` folder separately (e.g., `admin.yourdomain.com`). This ensures total separation of admin and user traffic.

---

## 🛠️ Important Security Details

### Master Access Key (පරිපාලක සඳහා රහස් කේතය)
The Admin Dashboard is locked with a Master Key.
*   **Default Key:** `KVIP-7788-ADMIN`
*   **How to Change:** Go to your Supabase **Table Editor** -> `admin_config` table -> Change the `key_value`.

### Admin Access restriction
Only users whose email matches the policy in `database_schema.sql` can manage data.
*   **Current Admin Email:** `admin@killersvip.com` (You can change this in the SQL file before running).

### Source Code Protection
Right-click and common DevTool shortcuts are disabled manually via `js/security.js` to prevent code theft.

---
