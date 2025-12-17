-- =====================================================
-- Reform One: Row Level Security (RLS) Configuration
-- =====================================================
-- This script enables RLS on all tables and creates policies
-- that only allow access via service_role (backend/API routes)
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Enable RLS on all tables
-- =====================================================

-- Core Organization & User tables
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Department" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserOrganization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invitation" ENABLE ROW LEVEL SECURITY;

-- Subscription & Billing tables
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Entitlement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Addon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;

-- Audit & Activity tables
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityLog" ENABLE ROW LEVEL SECURITY;

-- Seminar tables
ALTER TABLE "SeminarCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Seminar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SeminarParticipant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OpenSeminarRegistration" ENABLE ROW LEVEL SECURITY;

-- Archive tables
ALTER TABLE "Archive" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ArchiveView" ENABLE ROW LEVEL SECURITY;

-- Community tables
ALTER TABLE "CommunityCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MeetingArchive" ENABLE ROW LEVEL SECURITY;

-- Databook tables
ALTER TABLE "Databook" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DatabookDownload" ENABLE ROW LEVEL SECURITY;

-- Newsletter table
ALTER TABLE "Newsletter" ENABLE ROW LEVEL SECURITY;

-- Site Visit tables
ALTER TABLE "SiteVisit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteVisitParticipant" ENABLE ROW LEVEL SECURITY;

-- Qualification tables
ALTER TABLE "Qualification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserQualification" ENABLE ROW LEVEL SECURITY;

-- Tool tables
ALTER TABLE "Tool" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ToolUsageLog" ENABLE ROW LEVEL SECURITY;

-- Recommendation tables
ALTER TABLE "Recommendation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecommendationDismissal" ENABLE ROW LEVEL SECURITY;

-- Auth-related tables
ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmailVerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MfaBackupCode" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Create policies for service_role access
-- =====================================================
-- These policies allow full access only when using service_role key
-- (which is used by Prisma in API routes)

-- Organization tables
CREATE POLICY "service_role_all_organization" ON "Organization"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_organization_settings" ON "OrganizationSettings"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_department" ON "Department"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_user" ON "User"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_user_organization" ON "UserOrganization"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_session" ON "Session"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_invitation" ON "Invitation"
  FOR ALL USING (auth.role() = 'service_role');

-- Subscription & Billing tables
CREATE POLICY "service_role_all_subscription" ON "Subscription"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_entitlement" ON "Entitlement"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_addon" ON "Addon"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_invoice" ON "Invoice"
  FOR ALL USING (auth.role() = 'service_role');

-- Audit & Activity tables
CREATE POLICY "service_role_all_audit_log" ON "AuditLog"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_activity_log" ON "ActivityLog"
  FOR ALL USING (auth.role() = 'service_role');

-- Seminar tables
CREATE POLICY "service_role_all_seminar_category" ON "SeminarCategory"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_seminar" ON "Seminar"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_seminar_participant" ON "SeminarParticipant"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_open_seminar_registration" ON "OpenSeminarRegistration"
  FOR ALL USING (auth.role() = 'service_role');

-- Archive tables
CREATE POLICY "service_role_all_archive" ON "Archive"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_archive_view" ON "ArchiveView"
  FOR ALL USING (auth.role() = 'service_role');

-- Community tables
CREATE POLICY "service_role_all_community_category" ON "CommunityCategory"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_community_post" ON "CommunityPost"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_meeting_archive" ON "MeetingArchive"
  FOR ALL USING (auth.role() = 'service_role');

-- Databook tables
CREATE POLICY "service_role_all_databook" ON "Databook"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_databook_download" ON "DatabookDownload"
  FOR ALL USING (auth.role() = 'service_role');

-- Newsletter table
CREATE POLICY "service_role_all_newsletter" ON "Newsletter"
  FOR ALL USING (auth.role() = 'service_role');

-- Site Visit tables
CREATE POLICY "service_role_all_site_visit" ON "SiteVisit"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_site_visit_participant" ON "SiteVisitParticipant"
  FOR ALL USING (auth.role() = 'service_role');

-- Qualification tables
CREATE POLICY "service_role_all_qualification" ON "Qualification"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_user_qualification" ON "UserQualification"
  FOR ALL USING (auth.role() = 'service_role');

-- Tool tables
CREATE POLICY "service_role_all_tool" ON "Tool"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_tool_usage_log" ON "ToolUsageLog"
  FOR ALL USING (auth.role() = 'service_role');

-- Recommendation tables
CREATE POLICY "service_role_all_recommendation" ON "Recommendation"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_recommendation_dismissal" ON "RecommendationDismissal"
  FOR ALL USING (auth.role() = 'service_role');

-- Auth-related tables
CREATE POLICY "service_role_all_password_reset_token" ON "PasswordResetToken"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_email_verification_token" ON "EmailVerificationToken"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_mfa_backup_code" ON "MfaBackupCode"
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- VERIFICATION: Check RLS status
-- =====================================================
-- Run this after executing the script to verify RLS is enabled:
--
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- All tables should show rowsecurity = true
-- =====================================================
