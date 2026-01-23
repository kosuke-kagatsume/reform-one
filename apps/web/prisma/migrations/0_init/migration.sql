-- CreateEnum
CREATE TYPE "ApprovalActionType" AS ENUM ('submit', 'approve', 'reject', 'comment', 'remand', 'cancel');

-- CreateEnum
CREATE TYPE "ApprovalInstanceStatus" AS ENUM ('pending', 'in_progress', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "ApprovalStepStatus" AS ENUM ('waiting', 'pending', 'approved', 'rejected', 'skipped');

-- CreateEnum
CREATE TYPE "CalculationBasis" AS ENUM ('floor_area', 'wall_area', 'perimeter', 'ceiling_area', 'fixed', 'quantity');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('email', 'sms', 'line', 'dm', 'web', 'event', 'other');

-- CreateEnum
CREATE TYPE "CaseChannel" AS ENUM ('phone', 'email', 'chat', 'form', 'onsite', 'app', 'internal');

-- CreateEnum
CREATE TYPE "CaseEventType" AS ENUM ('created', 'status_changed', 'assigned', 'comment', 'customer_response', 'internal_note', 'escalated', 'approval_requested', 'approval_completed', 'attachment_added', 'related_linked', 'reopened');

-- CreateEnum
CREATE TYPE "CasePriority" AS ENUM ('P0', 'P1', 'P2', 'P3');

-- CreateEnum
CREATE TYPE "CaseSentiment" AS ENUM ('positive', 'neutral', 'negative', 'critical');

-- CreateEnum
CREATE TYPE "CaseSeverity" AS ENUM ('S1', 'S2', 'S3', 'S4');

-- CreateEnum
CREATE TYPE "CaseSource" AS ENUM ('customer', 'internal', 'auto');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('new', 'acknowledged', 'investigating', 'in_progress', 'customer_agreed', 'verifying', 'awaiting_deployment', 'resolved', 'closed', 'wont_fix', 'reopened');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('complaint', 'issue');

-- CreateEnum
CREATE TYPE "CaseUrgency" AS ENUM ('U1', 'U2', 'U3', 'U4');

-- CreateEnum
CREATE TYPE "EstimateTemplateCategory" AS ENUM ('NEW_CONSTRUCTION', 'REFORM', 'RENOVATION', 'EXTERIOR', 'PAINTING', 'OTHER');

-- CreateEnum
CREATE TYPE "EstimateTemplateScope" AS ENUM ('PERSONAL', 'BRANCH', 'COMPANY');

-- CreateEnum
CREATE TYPE "SLAStatus" AS ENUM ('safe', 'warning', 'danger', 'violated');

-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('work_type', 'customer_type', 'priority', 'status', 'source', 'custom');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('CUSTOMER_VISIT', 'ESTIMATE_FOLLOWUP', 'CONTRACT_CHECK', 'DEADLINE_ALERT', 'APPROVAL_PENDING', 'SITE_INSPECTION', 'INVOICE_DUE', 'PAYMENT_CHECK', 'MANUAL', 'COMPANY_EVENT', 'OTHER');

-- CreateTable
CREATE TABLE "ab_tests" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "variantA" JSONB NOT NULL,
    "variantB" JSONB NOT NULL,
    "winnerMetric" TEXT NOT NULL DEFAULT 'open_rate',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_mappings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "drmAccountCode" TEXT NOT NULL,
    "drmAccountName" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT,
    "externalCode" TEXT NOT NULL,
    "externalName" TEXT NOT NULL,
    "externalSubCode" TEXT,
    "externalSubName" TEXT,
    "defaultTaxCode" TEXT,
    "defaultTaxName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAutoMapped" BOOLEAN NOT NULL DEFAULT false,
    "mappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mappedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_subject_master" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parentCode" TEXT,
    "accountingCode" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "account_subject_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_integrations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'none',
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "companyId" TEXT,
    "companyName" TEXT,
    "fiscalYears" JSONB,
    "autoSyncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncFrequency" TEXT NOT NULL DEFAULT 'manual',
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL DEFAULT 'idle',
    "lastSyncError" TEXT,
    "syncJournals" BOOLEAN NOT NULL DEFAULT true,
    "syncAccounts" BOOLEAN NOT NULL DEFAULT true,
    "syncPartners" BOOLEAN NOT NULL DEFAULT true,
    "syncDepartments" BOOLEAN NOT NULL DEFAULT true,
    "yayoiVersion" TEXT,
    "yayoiExportPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "accounting_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_attachments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "category" TEXT,
    "duration" INTEGER,
    "transcription" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_type_masters" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "activity_type_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_notification_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL,
    "emailRecipients" TEXT[],
    "slackEnabled" BOOLEAN NOT NULL,
    "slackWebhookUrl" TEXT,
    "slackChannel" TEXT,
    "chatworkEnabled" BOOLEAN NOT NULL,
    "chatworkApiToken" TEXT,
    "chatworkRoomId" TEXT,
    "lineworksEnabled" BOOLEAN NOT NULL,
    "lineworksBotId" TEXT,
    "lineworksBotSecret" TEXT,
    "lineworksAccessToken" TEXT,
    "lineworksChannelId" TEXT,
    "notifications" JSONB NOT NULL,
    "timing" JSONB NOT NULL,
    "recipients" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "admin_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "ipWhitelist" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_metrics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "userId" TEXT,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_actions" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "stepOrder" INTEGER,
    "actionType" "ApprovalActionType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_condition" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "conditionGroup" TEXT NOT NULL DEFAULT 'default',
    "logicalOperator" TEXT NOT NULL DEFAULT 'AND',
    "field" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_flow_master" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "triggers" JSONB,
    "useOrganizationHierarchy" BOOLEAN NOT NULL DEFAULT false,
    "organizationLevels" INTEGER,
    "conditionalFlows" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "approval_flow_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_instance_steps" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "approverType" TEXT NOT NULL,
    "approverId" TEXT,
    "approverName" TEXT,
    "status" "ApprovalStepStatus" NOT NULL DEFAULT 'waiting',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_instance_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_instances" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "flowId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentNo" TEXT,
    "status" "ApprovalInstanceStatus" NOT NULL DEFAULT 'pending',
    "requesterId" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requestComment" TEXT,
    "amount" BIGINT NOT NULL DEFAULT 0,
    "customerId" TEXT,
    "customerName" TEXT,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_step" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mode" TEXT NOT NULL,
    "approvers" JSONB NOT NULL,
    "approverSelectionMode" TEXT NOT NULL DEFAULT 'organizational',
    "requiredApprovals" INTEGER,
    "timeoutHours" INTEGER,
    "allowDelegate" BOOLEAN NOT NULL DEFAULT false,
    "allowSkip" BOOLEAN NOT NULL DEFAULT false,
    "dependsOnPreviousStep" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_history" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "opportunityId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "fromUserId" TEXT,
    "fromUserName" TEXT,
    "toUserId" TEXT NOT NULL,
    "toUserName" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" TEXT,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_history" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "backupSettingsId" TEXT NOT NULL,
    "backupType" TEXT NOT NULL,
    "backupStatus" TEXT NOT NULL,
    "backupSize" INTEGER,
    "backupDuration" INTEGER,
    "backupFileName" TEXT,
    "backupFilePath" TEXT,
    "backupFileHash" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "errorDetails" TEXT,
    "restoredAt" TIMESTAMP(3),
    "restoredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "autoBackupEnabled" BOOLEAN NOT NULL DEFAULT true,
    "backupFrequency" TEXT NOT NULL DEFAULT 'daily',
    "backupTime" TEXT NOT NULL DEFAULT '02:00',
    "backupDayOfWeek" INTEGER DEFAULT 0,
    "backupDayOfMonth" INTEGER DEFAULT 1,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "maxBackupCount" INTEGER NOT NULL DEFAULT 10,
    "compressionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "encryptionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "storagePath" TEXT,
    "storageAccessKey" TEXT,
    "storageSecretKey" TEXT,
    "storageBucket" TEXT,
    "storageRegion" TEXT,
    "notifyOnSuccess" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "notificationEmail" TEXT,
    "notificationSlack" TEXT,
    "lastBackupAt" TIMESTAMP(3),
    "lastBackupStatus" TEXT,
    "lastBackupSize" INTEGER,
    "lastBackupError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "backup_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "billingTiming" TEXT NOT NULL DEFAULT 'milestone',
    "splitPatterns" JSONB NOT NULL DEFAULT '[{"id": "pattern1", "name": "3分割（30-40-30）", "percentages": [30, 40, 30]}, {"id": "pattern2", "name": "4分割（10-30-30-30）", "percentages": [10, 30, 30, 30]}, {"id": "pattern3", "name": "2分割（50-50）", "percentages": [50, 50]}]',
    "activePatternId" TEXT NOT NULL DEFAULT 'pattern1',
    "autoSendInvoice" BOOLEAN NOT NULL DEFAULT true,
    "autoSendReminder" BOOLEAN NOT NULL DEFAULT true,
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 3,
    "includeProgressInInvoice" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cache_metrics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "misses" INTEGER NOT NULL DEFAULT 0,
    "hitRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cache_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "targetSegment" TEXT NOT NULL DEFAULT 'all',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "budget" BIGINT NOT NULL DEFAULT 0,
    "actualCost" BIGINT NOT NULL DEFAULT 0,
    "targetCount" INTEGER NOT NULL DEFAULT 0,
    "targeting" JSONB,
    "content" JSONB,
    "metrics" JSONB,
    "workTypeTags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_attachments" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filesize" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "uploadedByName" TEXT NOT NULL,
    "uploadedByEmail" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_events" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" "CaseEventType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "actorEmail" TEXT,
    "actorDepartment" TEXT,
    "content" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_relations" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "objectTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_watchers" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT,
    "department" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_watchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "caseType" "CaseType" NOT NULL,
    "source" "CaseSource" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'new',
    "severity" "CaseSeverity" NOT NULL,
    "urgency" "CaseUrgency" NOT NULL,
    "priority" "CasePriority" NOT NULL,
    "assigneeId" TEXT,
    "assigneeName" TEXT,
    "assigneeEmail" TEXT,
    "assigneeDepartment" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdByEmail" TEXT,
    "createdByDepartment" TEXT,
    "relatedCustomerId" TEXT,
    "relatedCustomerName" TEXT,
    "relatedCustomerCompany" TEXT,
    "relatedCustomerPhone" TEXT,
    "relatedCustomerEmail" TEXT,
    "relatedProjectId" TEXT,
    "relatedProjectName" TEXT,
    "channel" "CaseChannel" NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sentiment" "CaseSentiment",
    "customerAgreedAt" TIMESTAMP(3),
    "compensationAmount" BIGINT,
    "refundAmount" BIGINT,
    "rootCause" TEXT,
    "permanentFix" TEXT,
    "releaseId" TEXT,
    "slaStatus" "SLAStatus" NOT NULL DEFAULT 'safe',
    "slaPriority" "CasePriority",
    "slaFirstResponseMin" INTEGER NOT NULL DEFAULT 60,
    "slaMtaMin" INTEGER NOT NULL DEFAULT 60,
    "slaTempFixHours" INTEGER NOT NULL DEFAULT 4,
    "slaPermFixHours" INTEGER NOT NULL DEFAULT 72,
    "slaFirstResponseDue" TIMESTAMP(3),
    "slaFirstResponseAt" TIMESTAMP(3),
    "slaResolutionDue" TIMESTAMP(3),
    "slaResolvedAt" TIMESTAMP(3),
    "slaRemainingMin" INTEGER NOT NULL DEFAULT 0,
    "slaViolationCount" INTEGER NOT NULL DEFAULT 0,
    "acknowledgedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "reopenCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_branding" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "companyName" TEXT NOT NULL,
    "companyNameEn" TEXT,
    "postalCode" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "website" TEXT,
    "registrationNumber" TEXT,
    "licensePlate" TEXT,
    "taxNumber" TEXT,
    "logoUrl" TEXT,
    "logoWidth" INTEGER NOT NULL DEFAULT 150,
    "logoHeight" INTEGER NOT NULL DEFAULT 50,
    "logoPosition" TEXT NOT NULL DEFAULT 'left',
    "colorTheme" JSONB NOT NULL DEFAULT '{"text": "#1F2937", "accent": "#818CF8", "border": "#E5E7EB", "primary": "#4F46E5", "secondary": "#6366F1", "background": "#FFFFFF"}',
    "primaryFont" TEXT NOT NULL DEFAULT 'Noto Sans JP, sans-serif',
    "secondaryFont" TEXT NOT NULL DEFAULT 'Noto Sans JP, sans-serif',
    "fontSize" JSONB NOT NULL DEFAULT '{"body": 12, "small": 10, "title": 24, "header": 18}',
    "sealImageUrl" TEXT,
    "signatureImageUrl" TEXT,
    "bankInfo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "company_branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "construction_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_ledgers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "propertyId" TEXT,
    "ledgerNo" TEXT NOT NULL,
    "constructionName" TEXT NOT NULL,
    "constructionType" TEXT NOT NULL,
    "constructionAddress" TEXT,
    "constructionCity" TEXT,
    "constructionPrefecture" TEXT,
    "scheduledStartDate" TEXT,
    "scheduledEndDate" TEXT,
    "actualStartDate" TEXT,
    "actualEndDate" TEXT,
    "contractDate" TEXT,
    "deliveryDate" TEXT,
    "totalContractAmount" BIGINT NOT NULL DEFAULT 0,
    "totalTaxAmount" BIGINT NOT NULL DEFAULT 0,
    "totalContractWithTax" BIGINT NOT NULL DEFAULT 0,
    "budgetMaterialCost" BIGINT NOT NULL DEFAULT 0,
    "budgetLaborCost" BIGINT NOT NULL DEFAULT 0,
    "budgetSubcontractCost" BIGINT NOT NULL DEFAULT 0,
    "budgetExpenseCost" BIGINT NOT NULL DEFAULT 0,
    "budgetTotal" BIGINT NOT NULL DEFAULT 0,
    "expectedProfit" BIGINT NOT NULL DEFAULT 0,
    "expectedProfitRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualMaterialCost" BIGINT NOT NULL DEFAULT 0,
    "actualLaborCost" BIGINT NOT NULL DEFAULT 0,
    "actualSubcontractCost" BIGINT NOT NULL DEFAULT 0,
    "actualExpenseCost" BIGINT NOT NULL DEFAULT 0,
    "actualTotal" BIGINT NOT NULL DEFAULT 0,
    "actualProfit" BIGINT NOT NULL DEFAULT 0,
    "actualProfitRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "progressRate" INTEGER NOT NULL DEFAULT 0,
    "completedWorkValue" BIGINT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "salesPersonId" TEXT,
    "salesPersonName" TEXT,
    "constructionManagerId" TEXT,
    "constructionManagerName" TEXT,
    "fiscalYear" INTEGER,
    "fiscalHalf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "construction_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_phases" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "phaseName" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "scheduledStart" TEXT,
    "scheduledEnd" TEXT,
    "actualStart" TEXT,
    "actualEnd" TEXT,
    "progressRate" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "dwPhaseId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "construction_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_sub_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "construction_sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "role" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "postalCode" TEXT,
    "prefecture" TEXT,
    "city" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_changes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "originalContractId" TEXT NOT NULL,
    "changeNo" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "changeName" TEXT NOT NULL,
    "description" TEXT,
    "changeAmount" BIGINT NOT NULL,
    "taxAmount" BIGINT NOT NULL DEFAULT 0,
    "totalChangeAmount" BIGINT NOT NULL,
    "estimatedCost" BIGINT NOT NULL DEFAULT 0,
    "actualCost" BIGINT NOT NULL DEFAULT 0,
    "requestedDate" TEXT,
    "requestedBy" TEXT,
    "requestedByName" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
    "approvedDate" TEXT,
    "approvedBy" TEXT,
    "approvedByName" TEXT,
    "contractStatus" TEXT NOT NULL DEFAULT 'draft',
    "signedDate" TEXT,
    "signedDocumentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "contract_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_inspections" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "contractId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "propertyId" TEXT,
    "propertyName" TEXT,
    "scheduledDate" TEXT NOT NULL,
    "reminderDate" TEXT,
    "actualDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assigneeId" TEXT,
    "assigneeName" TEXT,
    "result" TEXT,
    "notes" TEXT,
    "checkResults" JSONB,
    "attachments" JSONB,
    "nextAction" TEXT,
    "nextActionDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,

    CONSTRAINT "contract_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "estimateNo" TEXT NOT NULL,
    "contractNo" TEXT NOT NULL,
    "contractDate" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerCompany" TEXT,
    "customerAddress" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "contractType" TEXT NOT NULL,
    "contractAmount" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "paymentSchedule" TEXT,
    "billingType" TEXT,
    "billedAmount" DOUBLE PRECISION,
    "remainingAmount" DOUBLE PRECISION,
    "clauses" TEXT NOT NULL,
    "estimateItems" TEXT,
    "status" TEXT NOT NULL,
    "approvalStatus" TEXT,
    "approvalFlowId" TEXT,
    "manager" TEXT NOT NULL,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "signedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "attachments" TEXT,
    "notes" TEXT,
    "payments" TEXT,
    "completionDate" TEXT,
    "handoverDate" TEXT,
    "inspectionPlanId" TEXT,
    "aftercareAssigneeId" TEXT,
    "aftercareAssigneeName" TEXT,
    "ledgerId" TEXT,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "costOverrunThreshold" INTEGER NOT NULL DEFAULT 10,
    "profitMarginWarningThreshold" INTEGER NOT NULL DEFAULT 5,
    "scheduleDelayThreshold" INTEGER NOT NULL DEFAULT 7,
    "autoApprovalEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoApprovalProfitMargin" INTEGER NOT NULL DEFAULT 15,
    "differenceUnit" TEXT NOT NULL DEFAULT 'yen',
    "positiveColor" TEXT NOT NULL DEFAULT '#10b981',
    "negativeColor" TEXT NOT NULL DEFAULT '#ef4444',
    "neutralRange" INTEGER NOT NULL DEFAULT 3,
    "neutralColor" TEXT NOT NULL DEFAULT '#6b7280',
    "showPredictedProfit" BOOLEAN NOT NULL DEFAULT true,
    "showCostBreakdown" BOOLEAN NOT NULL DEFAULT true,
    "highlightRiskyProjects" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_subject_master" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "accountSubjectId" TEXT,
    "accountSubjectCode" TEXT,
    "accountSubjectName" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "cost_subject_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_activities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "customerId" TEXT NOT NULL,
    "propertyId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "nextAction" TEXT,
    "nextActionDate" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER,
    "outcome" TEXT,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_building_info" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "customerId" TEXT NOT NULL,
    "structureType" TEXT,
    "floorCount" INTEGER,
    "totalFloorArea" DOUBLE PRECISION,
    "builtYear" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_building_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_equipment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "customerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT,
    "manufacturer" TEXT,
    "modelNumber" TEXT,
    "installYear" INTEGER,
    "usageYears" INTEGER,
    "condition" TEXT NOT NULL DEFAULT 'good',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_family_members" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "livingStatus" TEXT NOT NULL DEFAULT 'cohabiting',
    "linkedCustomerId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_merge_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sourceCustomerId" TEXT NOT NULL,
    "targetCustomerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "mergedFields" TEXT,
    "conflictFields" TEXT,
    "sourceSnapshot" TEXT,
    "targetSnapshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "customer_merge_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_referrals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "referralDate" TIMESTAMP(3),
    "contractStatus" TEXT NOT NULL DEFAULT 'pending',
    "thanksSent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "numberingFormat" TEXT NOT NULL DEFAULT '{TENANT}-{FY}{MM}-{seq}',
    "numberingStart" INTEGER NOT NULL DEFAULT 1,
    "numberingDigits" INTEGER NOT NULL DEFAULT 5,
    "resetFrequency" TEXT NOT NULL DEFAULT 'monthly',
    "autoConvert" BOOLEAN NOT NULL DEFAULT true,
    "convertTrigger" TEXT NOT NULL DEFAULT 'assignment',
    "scoreThreshold" INTEGER NOT NULL DEFAULT 0,
    "requireMinData" BOOLEAN NOT NULL DEFAULT true,
    "emailMatchConf" INTEGER NOT NULL DEFAULT 100,
    "phoneMatchConf" INTEGER NOT NULL DEFAULT 100,
    "fuzzyMatchConf" INTEGER NOT NULL DEFAULT 80,
    "autoMerge" BOOLEAN NOT NULL DEFAULT false,
    "vipLtvThreshold" DOUBLE PRECISION NOT NULL DEFAULT 10000000,
    "vipOrderThreshold" INTEGER NOT NULL DEFAULT 5,
    "segmentUpdateFreq" TEXT NOT NULL DEFAULT 'daily',
    "auditRetention" INTEGER NOT NULL DEFAULT 365,
    "auditLogLevel" TEXT NOT NULL DEFAULT 'all',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "customer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_tags" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "customer_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT,
    "customerType" TEXT NOT NULL DEFAULT 'individual',
    "companyName" TEXT,
    "department" TEXT,
    "position" TEXT,
    "postalCode" TEXT,
    "prefecture" TEXT,
    "city" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "primaryContactId" TEXT,
    "assignedToId" TEXT,
    "assignedToName" TEXT,
    "assignedAt" TIMESTAMP(3),
    "segment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "rank" TEXT,
    "projectType" TEXT,
    "projectName" TEXT,
    "expectedRevenue" DOUBLE PRECISION,
    "originalLeadId" TEXT,
    "totalLeads" INTEGER NOT NULL DEFAULT 1,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetimeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastOrderDate" TIMESTAMP(3),
    "contractPreference" TEXT NOT NULL DEFAULT 'electronic',
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "additionalAddresses" JSONB,
    "birthDate" TIMESTAMP(3),
    "employerName" TEXT,
    "employerPosition" TEXT,
    "employerYearsOfService" INTEGER,
    "leadSource" TEXT,
    "notes" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_access_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dashboardMinLevels" JSONB NOT NULL DEFAULT '{"sales": 3, "office": 2, "manager": 6, "executive": 8, "marketing": 5, "accounting": 5, "construction": 3}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "dashboard_access_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "salesTargets" JSONB NOT NULL DEFAULT '{"yearlyTarget": 1500, "monthlyTarget": 125, "growthRateTarget": 10}',
    "grossProfitTargets" JSONB NOT NULL DEFAULT '{"marginTarget": 20, "monthlyAmountTarget": 25}',
    "orderTargets" JSONB NOT NULL DEFAULT '{"growthRateTarget": 15, "monthlyOrdersTarget": 20, "conversionRateTarget": 70}',
    "ordinaryProfitTargets" JSONB NOT NULL DEFAULT '{"yearlyTarget": 30, "monthlyTarget": 2.5, "growthRateTarget": 10}',
    "trendThresholds" JSONB NOT NULL DEFAULT '{"warningThreshold": -3, "strongGrowthThreshold": 5, "consecutiveGrowthMonths": 3, "significantGrowthThreshold": 15}',
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_master" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "parentCode" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "department_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,
    "path" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "managerId" TEXT,
    "managerName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "extension" TEXT,
    "postalCode" TEXT,
    "prefecture" TEXT,
    "city" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT,
    "storageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "description" TEXT,
    "tags" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "contractId" TEXT,
    "ledgerId" TEXT,
    "estimateId" TEXT,
    "orderId" TEXT,
    "customerId" TEXT,
    "dwDocumentId" TEXT,
    "dwSyncStatus" TEXT NOT NULL DEFAULT 'local',
    "dwSyncedAt" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'drm',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "modelNumber" TEXT,
    "installedAt" TIMESTAMP(3) NOT NULL,
    "warrantyEnd" TIMESTAMP(3),
    "isReplaced" BOOLEAN NOT NULL DEFAULT false,
    "replacedAt" TIMESTAMP(3),
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "EstimateTemplateCategory" NOT NULL,
    "scope" "EstimateTemplateScope" NOT NULL DEFAULT 'PERSONAL',
    "branch" TEXT,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "type" TEXT NOT NULL DEFAULT 'detailed',
    "customerId" TEXT,
    "opportunityId" TEXT,
    "customerName" TEXT,
    "customerCompany" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "customerAddress" TEXT,
    "projectName" TEXT,
    "projectType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "lostReason" TEXT,
    "lostReasonDetail" TEXT,
    "totalAmount" BIGINT NOT NULL DEFAULT 0,
    "taxAmount" BIGINT NOT NULL DEFAULT 0,
    "totalWithTax" BIGINT NOT NULL DEFAULT 0,
    "estimatedCost" BIGINT NOT NULL DEFAULT 0,
    "estimatedProfit" BIGINT NOT NULL DEFAULT 0,
    "items" JSONB NOT NULL DEFAULT '[]',
    "financialData" JSONB,
    "loanInfo" JSONB,
    "buildingArea" DOUBLE PRECISION,
    "unitPrice" DOUBLE PRECISION,
    "version" INTEGER NOT NULL DEFAULT 1,
    "versionLabel" TEXT,
    "parentId" TEXT,
    "proposalType" TEXT NOT NULL DEFAULT 'A',
    "validUntil" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "estimateNo" TEXT,
    "title" TEXT,

    CONSTRAINT "estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_budgets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "memo" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isIncome" BOOLEAN NOT NULL DEFAULT false,
    "defaultPaymentDay" INTEGER NOT NULL,
    "isDepartmentLevel" BOOLEAN NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_attachments" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isScreenshot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "feedback_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_comments" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_upvotes" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_upvotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "reporterId" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterEmail" TEXT,
    "pageUrl" TEXT,
    "browserInfo" TEXT,
    "assigneeId" TEXT,
    "assigneeName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_plan_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "displayOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "subtotalLabel" TEXT,
    "color" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_plan_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_plan_category_items" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "includeInContract" BOOLEAN NOT NULL DEFAULT false,
    "salesEditable" BOOLEAN NOT NULL DEFAULT true,
    "defaultAmount" INTEGER NOT NULL DEFAULT 0,
    "defaultNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_plan_category_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_plan_cost_details" (
    "id" TEXT NOT NULL,
    "financialPlanId" TEXT NOT NULL,
    "itemCategory" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "sellingPrice" INTEGER NOT NULL,
    "costPrice" INTEGER NOT NULL,
    "grossProfit" INTEGER NOT NULL,
    "grossProfitRate" DOUBLE PRECISION NOT NULL,
    "vendorId" TEXT,
    "vendorName" TEXT,
    "orderId" TEXT,
    "orderDate" TIMESTAMP(3),
    "orderStatus" TEXT,
    "note" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_plan_cost_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_plans" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "previousVersionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "buildingArea" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "financialData" JSONB NOT NULL,
    "loanInfo" JSONB NOT NULL,
    "changeNote" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "full_reno_estimate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "customerId" TEXT,
    "projectName" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL DEFAULT 'mansion',
    "version" INTEGER NOT NULL DEFAULT 1,
    "versionNote" TEXT,
    "parentId" TEXT,
    "propertyAddress" TEXT,
    "defaultCeilingHeight" DOUBLE PRECISION NOT NULL DEFAULT 2400,
    "totalFloorArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalWallArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" BIGINT NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "taxAmount" BIGINT NOT NULL DEFAULT 0,
    "totalAmount" BIGINT NOT NULL DEFAULT 0,
    "totalCost" BIGINT NOT NULL DEFAULT 0,
    "grossProfit" BIGINT NOT NULL DEFAULT 0,
    "grossProfitRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "categorySettings" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "full_reno_estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "full_reno_room" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION NOT NULL,
    "ceilingHeight" DOUBLE PRECISION NOT NULL DEFAULT 2400,
    "floorArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wallPerimeter" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wallArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ceilingArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openingArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netWallArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "full_reno_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "full_reno_room_opening" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "openingMasterId" TEXT,
    "customName" TEXT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "full_reno_room_opening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "full_reno_work_item" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "workItemMasterId" TEXT,
    "roomId" TEXT,
    "categoryId" TEXT,
    "subCategoryId" TEXT,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "calculationBasis" "CalculationBasis" NOT NULL,
    "baseQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "materialCoef" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "laborCoef" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" BIGINT NOT NULL DEFAULT 0,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" BIGINT NOT NULL DEFAULT 0,
    "grossProfit" BIGINT NOT NULL DEFAULT 0,
    "grossProfitRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "full_reno_work_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "full_reno_work_item_master" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "categoryId" TEXT NOT NULL,
    "subCategoryId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "productMasterId" TEXT,
    "unit" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marginRate" DOUBLE PRECISION NOT NULL DEFAULT 0.35,
    "calculationBasis" "CalculationBasis" NOT NULL,
    "materialCoef" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "laborCoef" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "roofExtensionCoef" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "applicableToMansion" BOOLEAN NOT NULL DEFAULT true,
    "applicableToHouse" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "full_reno_work_item_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_calendar_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "calendarId" TEXT NOT NULL DEFAULT 'primary',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_calendar_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hierarchical_targets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "annualSalesTarget" BIGINT NOT NULL,
    "annualGrossProfitTarget" BIGINT NOT NULL,
    "annualOrderCountTarget" INTEGER NOT NULL,
    "monthlyTargets" JSONB NOT NULL,
    "seasonalPatternId" TEXT,
    "distributionRule" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "companyName" TEXT,
    "departmentId" TEXT,
    "departmentName" TEXT,
    "categoryId" TEXT,
    "categoryName" TEXT,
    "categoryCode" TEXT,
    "standardGrossMargin" DOUBLE PRECISION,
    "productId" TEXT,
    "productName" TEXT,
    "productCode" TEXT,
    "personId" TEXT,
    "personName" TEXT,
    "parentId" TEXT,
    "allocationRate" DOUBLE PRECISION,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hierarchical_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_plan_steps" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthsAfter" INTEGER NOT NULL,
    "daysAfter" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "checkItems" JSONB,
    "estimatedTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_plan_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_plans" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "baseDateType" TEXT NOT NULL DEFAULT 'completion',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "inspection_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "invoiceNo" TEXT NOT NULL,
    "invoiceDate" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "contractId" TEXT,
    "contractNo" TEXT,
    "milestoneId" TEXT,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerCompany" TEXT,
    "customerAddress" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "projectName" TEXT,
    "projectType" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "subtotal" DECIMAL(18,2) NOT NULL,
    "taxRate" INTEGER NOT NULL DEFAULT 10,
    "taxAmount" DECIMAL(18,2) NOT NULL,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "paymentTerms" TEXT,
    "paymentMethod" TEXT,
    "bankInfo" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "paidAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paidDate" TEXT,
    "approvalStatus" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "sentDate" TEXT,
    "sentMethod" TEXT,
    "sentTo" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "createdBy" TEXT,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idempotencyKey" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_sync_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "provider" TEXT NOT NULL,
    "syncDirection" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "fiscalYear" INTEGER,
    "fiscalMonth" INTEGER,
    "targetPeriodStart" TEXT,
    "targetPeriodEnd" TEXT,
    "sourceTable" TEXT,
    "sourceIds" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "errorDetails" JSONB,
    "exportFileUrl" TEXT,
    "exportFileName" TEXT,
    "exportFileSize" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "executedBy" TEXT NOT NULL,

    CONSTRAINT "journal_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_sync_queue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "provider" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "sourceTable" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "journalData" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "errorMessage" TEXT,
    "externalId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "journal_sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journeys" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "steps" JSONB NOT NULL DEFAULT '[]',
    "entryRules" JSONB,
    "exitRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "score" INTEGER NOT NULL DEFAULT 0,
    "lastScored" TIMESTAMP(3),
    "activities" JSONB NOT NULL DEFAULT '[]',
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_expenses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "changeId" TEXT,
    "expenseNo" TEXT NOT NULL,
    "expenseDate" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "taxAmount" BIGINT NOT NULL DEFAULT 0,
    "totalAmount" BIGINT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "unitPrice" BIGINT,
    "payeeName" TEXT,
    "payeeType" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT,
    "accountSubjectCode" TEXT,
    "accountSubjectId" TEXT,
    "accountSubjectName" TEXT,

    CONSTRAINT "ledger_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_ab_tests" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "variants" TEXT NOT NULL,
    "trafficSplit" TEXT NOT NULL,
    "goalType" TEXT NOT NULL,
    "goalValue" TEXT,
    "totalVisitors" INTEGER NOT NULL DEFAULT 0,
    "totalConversions" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidenceLevel" DOUBLE PRECISION,
    "pValue" DOUBLE PRECISION,
    "winner" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ma_ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_auto_assignment_rules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "sourceFilter" TEXT,
    "inquiryTypeFilter" TEXT,
    "prefectureFilter" TEXT,
    "urgencyFilter" TEXT,
    "assignmentType" TEXT NOT NULL,
    "targetUserIds" TEXT,
    "activeHoursStart" TEXT DEFAULT '09:00',
    "activeHoursEnd" TEXT DEFAULT '18:00',
    "activeDaysOfWeek" TEXT,
    "afterHoursAssignee" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ma_auto_assignment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_calendar_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "duration" INTEGER,
    "location" TEXT,
    "participants" INTEGER,
    "reminder" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "executedAt" TIMESTAMP(3),
    "actualParticipants" INTEGER,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "ma_calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_conversions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "contractId" TEXT,
    "source" TEXT NOT NULL,
    "campaign" TEXT,
    "medium" TEXT,
    "convertedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "ma_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_email_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'custom',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "variables" JSONB NOT NULL DEFAULT '[]',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "openRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clickRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "ma_email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_email_tracking" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "leadId" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "bounced" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "clickedLinks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ma_email_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_emails" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "replyTo" TEXT,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT,
    "templateId" TEXT,
    "status" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "segment" TEXT,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openedCount" INTEGER NOT NULL DEFAULT 0,
    "clickedCount" INTEGER NOT NULL DEFAULT 0,
    "bouncedCount" INTEGER NOT NULL DEFAULT 0,
    "unsubscribedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ma_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_journey_executions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL,
    "totalSteps" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "lastActionAt" TIMESTAMP(3),
    "executionLog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ma_journey_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_journeys" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "triggerConfig" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "totalContacts" INTEGER NOT NULL DEFAULT 0,
    "activeContacts" INTEGER NOT NULL DEFAULT 0,
    "completedContacts" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "activatedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),

    CONSTRAINT "ma_journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_lead_duplicates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sourceLeadId" TEXT NOT NULL,
    "targetLeadId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "mergedBy" TEXT,
    "mergedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ma_lead_duplicates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_leads" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "postalCode" TEXT,
    "prefecture" TEXT,
    "city" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" INTEGER,
    "priority" TEXT,
    "inquiryType" TEXT,
    "budget" DOUBLE PRECISION,
    "inquiryContent" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'normal',
    "urgencyReason" TEXT,
    "responseDeadline" TIMESTAMP(3),
    "duplicateCheckHash" TEXT,
    "relatedLeadIds" TEXT,
    "dataCompletenessScore" INTEGER NOT NULL DEFAULT 0,
    "missingFields" TEXT,
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "lostReason" TEXT,
    "lostReasonDetail" TEXT,
    "reactivationDate" TIMESTAMP(3),
    "tags" TEXT,
    "segment" TEXT,
    "firstTouchDate" TIMESTAMP(3),
    "lastActivityDate" TIMESTAMP(3),
    "conversionDate" TIMESTAMP(3),
    "propertyId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "convertedFromLeadId" TEXT,
    "revertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "tagReviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ma_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_segments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conditions" JSONB NOT NULL,
    "conditionLogic" TEXT NOT NULL DEFAULT 'and',
    "leadCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "icon" TEXT NOT NULL DEFAULT '📊',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "ma_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "scoringRules" JSONB NOT NULL DEFAULT '[]',
    "emailDelivery" JSONB NOT NULL DEFAULT '{}',
    "webhooks" JSONB NOT NULL DEFAULT '[]',
    "abTest" JSONB NOT NULL DEFAULT '{}',
    "journey" JSONB NOT NULL DEFAULT '{}',
    "roi" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "ma_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_webforms" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submissions" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "ma_webforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "websiteUrl" TEXT,
    "landingPages" JSONB,
    "socialLinks" JSONB,
    "portalSites" JSONB,
    "googleAdsId" TEXT,
    "metaAdsId" TEXT,
    "lineAdsId" TEXT,
    "monthlyAdBudget" JSONB,
    "scoringRules" JSONB,
    "autoAssignRules" JSONB,
    "hotLeadThreshold" INTEGER NOT NULL DEFAULT 80,
    "newLeadNotifyTo" TEXT[],
    "hotLeadNotifyTo" TEXT[],
    "unhandledAlertHours" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "marketing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "percentage" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "scheduledDate" TEXT NOT NULL,
    "actualDate" TEXT,
    "status" TEXT NOT NULL,
    "invoiceId" TEXT,
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_cash_balances" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "actualBalance" BIGINT NOT NULL,
    "bankName" TEXT,
    "accountType" TEXT,
    "memo" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "monthly_cash_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_expense_forecasts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "department" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDay" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "monthly_expense_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_expenses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dataSource" TEXT NOT NULL DEFAULT 'manual',
    "externalId" TEXT,
    "memo" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "actionUrl" TEXT,
    "documentType" TEXT,
    "documentId" TEXT,
    "senderId" TEXT,
    "senderName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_master" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "openingType" TEXT NOT NULL,
    "defaultWidth" INTEGER NOT NULL,
    "defaultHeight" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "opening_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimatedRevenue" DOUBLE PRECISION NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedProfit" DOUBLE PRECISION NOT NULL,
    "isOb" BOOLEAN NOT NULL DEFAULT false,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "probability" INTEGER NOT NULL,
    "rank" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "assignedToName" TEXT,
    "departmentId" TEXT,
    "expectedCloseDate" TIMESTAMP(3),
    "actualCloseDate" TIMESTAMP(3),
    "lostReason" TEXT,
    "lostReasonDetail" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "budgetCustomAmount" INTEGER,
    "budgetRange" TEXT,
    "decisionMakerInfluence" TEXT,
    "decisionMakerName" TEXT,
    "fundingStatus" TEXT,
    "influencerInfluence" TEXT,
    "influencerName" TEXT,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_work_masters" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "defaultCost" INTEGER NOT NULL,
    "defaultPrice" INTEGER NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "option_work_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ledgerId" TEXT,
    "contractId" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "orderDate" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "partnerId" TEXT,
    "partnerName" TEXT NOT NULL,
    "partnerCompany" TEXT,
    "workItems" JSONB NOT NULL,
    "subtotal" BIGINT NOT NULL,
    "taxAmount" BIGINT NOT NULL,
    "totalAmount" BIGINT NOT NULL,
    "startDate" TEXT,
    "endDate" TEXT,
    "duration" INTEGER,
    "paymentTerms" TEXT,
    "orderDeadline" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
    "dwSyncStatus" TEXT NOT NULL DEFAULT 'not_synced',
    "dwOrderId" TEXT,
    "dwSyncedAt" TIMESTAMP(3),
    "dwConstructionId" TEXT,
    "actualSubtotal" BIGINT,
    "actualTaxAmount" BIGINT,
    "actualTotalAmount" BIGINT,
    "varianceAmount" BIGINT,
    "varianceRate" DOUBLE PRECISION,
    "completedAt" TIMESTAMP(3),
    "managerId" TEXT,
    "managerName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "accountSubjectCode" TEXT,
    "accountSubjectId" TEXT,
    "accountSubjectName" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordinary_profit_targets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "targetAmount" BIGINT NOT NULL,
    "monthlyTargets" JSONB,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ordinary_profit_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_mappings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "drmPartnerId" TEXT NOT NULL,
    "drmPartnerCode" TEXT,
    "drmPartnerName" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT,
    "externalCode" TEXT,
    "externalName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAutoMapped" BOOLEAN NOT NULL DEFAULT false,
    "mappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mappedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_master" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT,
    "category" TEXT NOT NULL,
    "specialties" TEXT[],
    "representativeName" TEXT,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "postalCode" TEXT,
    "address" TEXT,
    "paymentTerms" TEXT,
    "bankInfo" JSONB,
    "rating" INTEGER NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "lastTransactionDate" TIMESTAMP(3),
    "performance" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "dwPartnerId" TEXT,
    "dwSyncStatus" TEXT NOT NULL DEFAULT 'not_synced',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "partner_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "paymentDate" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "paymentMethod" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unmatched',
    "invoiceId" TEXT,
    "invoiceNo" TEXT,
    "appliedToInvoice" BOOLEAN NOT NULL DEFAULT false,
    "matchedInvoices" JSONB,
    "unmatchedAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "matchedBy" TEXT,
    "matchedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_assets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "pdf_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "documentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "layout" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "styles" JSONB NOT NULL,
    "permissions" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "pdf_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_tiers" (
    "id" TEXT NOT NULL,
    "minUsers" INTEGER NOT NULL,
    "maxUsers" INTEGER,
    "pricePerUser" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "pricing_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_masters" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subCategoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "standardPrice" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "specifications" TEXT,
    "productType" TEXT,
    "maker" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "product_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_history" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "phaseId" TEXT,
    "progressRate" INTEGER NOT NULL,
    "note" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT,
    "recordedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "propertyNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "postalCode" TEXT,
    "prefecture" TEXT,
    "city" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "buildingType" TEXT,
    "buildingArea" DOUBLE PRECISION,
    "landArea" DOUBLE PRECISION,
    "builtYear" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rag_conversations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rag_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rag_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "monthlyQueryLimit" INTEGER NOT NULL DEFAULT 1000,
    "monthlyTokenLimit" INTEGER NOT NULL DEFAULT 500000,
    "model" TEXT NOT NULL DEFAULT 'gpt-4o',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rag_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rag_usage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "queryCount" INTEGER NOT NULL DEFAULT 0,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rag_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_reservations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "purpose" TEXT,
    "customerId" TEXT,
    "customerName" TEXT,
    "taskId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancelReason" TEXT,

    CONSTRAINT "resource_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER,
    "location" TEXT,
    "features" JSONB,
    "vehicleType" TEXT,
    "licensePlate" TEXT,
    "fuelType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "maxDuration" INTEGER,
    "advanceBooking" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "tenantId" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rounding_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'デフォルト設定',
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "itemAmountMethod" TEXT NOT NULL DEFAULT 'round',
    "itemAmountPrecision" INTEGER NOT NULL DEFAULT 0,
    "subtotalMethod" TEXT NOT NULL DEFAULT 'round',
    "subtotalPrecision" INTEGER NOT NULL DEFAULT 0,
    "taxMethod" TEXT NOT NULL DEFAULT 'floor',
    "taxCalculationTiming" TEXT NOT NULL DEFAULT 'subtotal',
    "taxPrecision" INTEGER NOT NULL DEFAULT 0,
    "discountMethod" TEXT NOT NULL DEFAULT 'round',
    "discountAllocation" TEXT NOT NULL DEFAULT 'last_item',
    "costMethod" TEXT NOT NULL DEFAULT 'round',
    "costPrecision" INTEGER NOT NULL DEFAULT 0,
    "progressMethod" TEXT NOT NULL DEFAULT 'floor',
    "progressPrecision" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rounding_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_activities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "nextAction" TEXT,
    "nextActionDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "sales_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_category_master" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "level" INTEGER NOT NULL,
    "standardGrossMargin" DOUBLE PRECISION NOT NULL,
    "profitDistribution" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "displayOrder" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "sales_category_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "passwordMinLength" INTEGER NOT NULL DEFAULT 8,
    "passwordRequireUpper" BOOLEAN NOT NULL DEFAULT true,
    "passwordRequireLower" BOOLEAN NOT NULL DEFAULT true,
    "passwordRequireNumber" BOOLEAN NOT NULL DEFAULT true,
    "passwordRequireSymbol" BOOLEAN NOT NULL DEFAULT false,
    "passwordExpirationDays" INTEGER DEFAULT 90,
    "passwordHistoryCount" INTEGER NOT NULL DEFAULT 5,
    "ipWhitelistEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ipWhitelist" TEXT,
    "ipBlacklistEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ipBlacklist" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorMethod" TEXT NOT NULL DEFAULT 'email',
    "twoFactorRequired" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 60,
    "maxConcurrentSessions" INTEGER NOT NULL DEFAULT 3,
    "sessionIdleTimeoutMinutes" INTEGER NOT NULL DEFAULT 30,
    "forceLogoutEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "lockoutDurationMinutes" INTEGER NOT NULL DEFAULT 30,
    "loginAttemptsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "auditLogEnabled" BOOLEAN NOT NULL DEFAULT true,
    "auditLogRetentionDays" INTEGER NOT NULL DEFAULT 365,
    "sensitiveDataMaskEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "system_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "planDefaults" JSONB NOT NULL DEFAULT '{"SMB": {"maxUsers": 5, "maxStorageBytes": 5368709120, "apiCallLimitDaily": 10000}, "Enterprise": {"maxUsers": 50, "maxStorageBytes": 53687091200, "apiCallLimitDaily": 100000}}',
    "featureFlags" JSONB NOT NULL DEFAULT '[{"code": "MA", "name": "MA機能", "description": "マーケティングオートメーション機能"}, {"code": "RAG", "name": "RAG/AI機能", "description": "AIアシスタント・RAG検索機能"}, {"code": "ExternalAPI", "name": "外部連携API", "description": "外部システム連携API"}]',
    "trialWarningDays" INTEGER NOT NULL DEFAULT 7,
    "trialAutoDisable" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_master" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "name" TEXT NOT NULL,
    "category" "TagCategory" NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'bg-gray-500',
    "icon" TEXT,
    "description" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "tag_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_automation_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "categoryEnabled" JSONB NOT NULL DEFAULT '{"lead": true, "order": true, "invoice": true, "payment": true, "approval": true, "contract": true, "customer": true, "estimate": true, "construction": true}',
    "taskSettings" JSONB NOT NULL DEFAULT '{}',
    "defaultDays" JSONB NOT NULL DEFAULT '{"followUp": 7, "reminder": 3, "escalation": 14}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "task_automation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_reminder_logs" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_reminder_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "dueTime" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "type" "TaskType" NOT NULL,
    "customerId" TEXT,
    "estimateId" TEXT,
    "contractId" TEXT,
    "invoiceId" TEXT,
    "opportunityId" TEXT,
    "googleEventId" TEXT,
    "googleCalendarId" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "reminderMinutes" INTEGER,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "parentTaskId" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "templateName" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "automationType" TEXT,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "relatedEntityName" TEXT,
    "customerName" TEXT,
    "assigneeEmail" TEXT,
    "assigneeName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_category_master" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxRate" INTEGER NOT NULL,
    "taxType" TEXT NOT NULL,
    "description" TEXT,
    "accountingCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT,

    CONSTRAINT "tax_category_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_fiscal_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyName" TEXT,
    "fiscalYearStartMonth" INTEGER NOT NULL DEFAULT 4,
    "firstFiscalYear" INTEGER NOT NULL,
    "foundedDate" TIMESTAMP(3),
    "constructionCategories" JSONB,
    "revenueRecognitionBasis" TEXT NOT NULL DEFAULT 'completion',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_fiscal_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_invoices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "billingPeriod" TEXT NOT NULL,
    "billingDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "additionalPrice" INTEGER NOT NULL,
    "prorationPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL,
    "totalWithTax" INTEGER NOT NULL,
    "startUserCount" INTEGER NOT NULL,
    "endUserCount" INTEGER NOT NULL,
    "userChanges" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "notes" TEXT,
    "pdfUrl" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),
    "downloadedBy" TEXT,
    "downloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "tenant_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dwApiEndpoint" TEXT,
    "dwApiKey" TEXT,
    "dwPlaceCode" TEXT,
    "dwSyncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dwSyncFrequency" TEXT NOT NULL DEFAULT 'daily_1am',
    "orderDeadlineDays" INTEGER NOT NULL DEFAULT 7,
    "alertBeforeDays" INTEGER NOT NULL DEFAULT 5,
    "notifySupervisor" BOOLEAN NOT NULL DEFAULT true,
    "notifyDepartmentHead" BOOLEAN NOT NULL DEFAULT true,
    "notifyCEO" BOOLEAN NOT NULL DEFAULT false,
    "approvalThresholds" JSONB,
    "leadAutoAssignEnabled" BOOLEAN NOT NULL DEFAULT false,
    "leadScoringEnabled" BOOLEAN NOT NULL DEFAULT false,
    "leadDuplicateCheckEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pipelineStages" JSONB,
    "opportunityStatuses" JSONB,
    "defaultProbability" INTEGER NOT NULL DEFAULT 10,
    "alertDaysNoContact" INTEGER NOT NULL DEFAULT 30,
    "alertDaysNoProgress" INTEGER NOT NULL DEFAULT 14,
    "forecastMinProbability" INTEGER NOT NULL DEFAULT 50,
    "longTermNoContactDays" INTEGER NOT NULL DEFAULT 90,
    "customerRanks" JSONB,
    "customerSegmentationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "integrationSettings" JSONB,
    "pdfSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estimateNumberDigits" INTEGER NOT NULL DEFAULT 5,
    "estimateNumberFormat" TEXT NOT NULL DEFAULT '{PREFIX}-{YYYY}-{SEQ}',
    "estimateNumberLastSeq" INTEGER NOT NULL DEFAULT 0,
    "estimateNumberLastYear" INTEGER,
    "estimateNumberPrefix" TEXT NOT NULL DEFAULT 'EST',
    "estimateNumberResetPeriod" TEXT NOT NULL DEFAULT 'yearly',
    "contractNumberDigits" INTEGER NOT NULL DEFAULT 5,
    "contractNumberFormat" TEXT NOT NULL DEFAULT '{PREFIX}-{YYYY}-{SEQ}',
    "contractNumberLastSeq" INTEGER NOT NULL DEFAULT 0,
    "contractNumberLastYear" INTEGER,
    "contractNumberPrefix" TEXT NOT NULL DEFAULT 'CNT',
    "contractNumberResetPeriod" TEXT NOT NULL DEFAULT 'yearly',
    "invoiceNumberDigits" INTEGER NOT NULL DEFAULT 4,
    "invoiceNumberFormat" TEXT NOT NULL DEFAULT '{PREFIX}-{YYYY}{MM}-{SEQ}',
    "invoiceNumberLastMonth" INTEGER,
    "invoiceNumberLastSeq" INTEGER NOT NULL DEFAULT 0,
    "invoiceNumberLastYear" INTEGER,
    "invoiceNumberPrefix" TEXT NOT NULL DEFAULT 'INV',
    "invoiceNumberResetPeriod" TEXT NOT NULL DEFAULT 'monthly',
    "orderNumberDigits" INTEGER NOT NULL DEFAULT 4,
    "orderNumberFormat" TEXT NOT NULL DEFAULT '{PREFIX}-{YYYY}-{SEQ}',
    "orderNumberLastSeq" INTEGER NOT NULL DEFAULT 0,
    "orderNumberLastYear" INTEGER,
    "orderNumberPrefix" TEXT NOT NULL DEFAULT 'ORD',
    "orderNumberResetPeriod" TEXT NOT NULL DEFAULT 'yearly',
    "propertyNumberDigits" INTEGER NOT NULL DEFAULT 5,
    "propertyNumberFormat" TEXT NOT NULL DEFAULT '{PREFIX}-{SEQ}',
    "propertyNumberLastSeq" INTEGER NOT NULL DEFAULT 0,
    "propertyNumberPrefix" TEXT NOT NULL DEFAULT 'PROP',
    "propertyNumberResetPeriod" TEXT NOT NULL DEFAULT 'never',

    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_usage_history" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userCount" INTEGER NOT NULL,
    "storageUsed" INTEGER,
    "apiCalls" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_usage_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'SMB',
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "currentUserCount" INTEGER NOT NULL DEFAULT 0,
    "monthlyPrice" INTEGER NOT NULL DEFAULT 5000,
    "billingEmail" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "accountHolderName" TEXT,
    "accountNumber" TEXT,
    "accountType" TEXT,
    "apiCallCountToday" INTEGER NOT NULL DEFAULT 0,
    "apiCallLimitDaily" INTEGER NOT NULL DEFAULT 10000,
    "apiCallResetAt" TIMESTAMP(3),
    "bankCode" TEXT,
    "bankName" TEXT,
    "billingCompanyName" TEXT,
    "branchCode" TEXT,
    "branchName" TEXT,
    "contractExpirationMonth" TEXT,
    "customerCode" TEXT,
    "featureExternalAPI" BOOLEAN NOT NULL DEFAULT false,
    "featureMA" BOOLEAN NOT NULL DEFAULT false,
    "featureRAG" BOOLEAN NOT NULL DEFAULT false,
    "maxStorageBytes" BIGINT NOT NULL DEFAULT 5368709120,
    "paymentMethod" TEXT NOT NULL DEFAULT 'bank_transfer',

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_cost_agreements" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "tradeCode" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "calculationType" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "unitLabel" TEXT NOT NULL,
    "minArea" DOUBLE PRECISION,
    "maxArea" DOUBLE PRECISION,
    "targetProfitRate" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "minProfitRate" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "defaultPartnerId" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "trade_cost_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_cost_price_ranges" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "minArea" DOUBLE PRECISION NOT NULL,
    "maxArea" DOUBLE PRECISION,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trade_cost_price_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "departmentId" TEXT,
    "position" TEXT,
    "employeeNo" TEXT,
    "hireDate" TEXT,
    "currentLeadCount" INTEGER NOT NULL DEFAULT 0,
    "maxLeadCapacity" INTEGER NOT NULL DEFAULT 20,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "autoAssignmentWeight" INTEGER NOT NULL DEFAULT 100,
    "specialties" TEXT,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "certifications" TEXT,
    "workingHoursStart" TEXT DEFAULT '09:00',
    "workingHoursEnd" TEXT DEFAULT '18:00',
    "workingDaysOfWeek" TEXT,
    "totalLeadsAssigned" INTEGER NOT NULL DEFAULT 0,
    "totalConversions" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageResponseTime" INTEGER NOT NULL DEFAULT 0,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "roleId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "invitationToken" TEXT,
    "invitationExpires" TIMESTAMP(3),
    "invitationStatus" TEXT DEFAULT 'pending',
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3),
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "permissionLevel" INTEGER NOT NULL DEFAULT 3,
    "accessibleDashboards" TEXT[] DEFAULT ARRAY['sales']::TEXT[],
    "primaryDashboard" TEXT NOT NULL DEFAULT 'sales',
    "customPermissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "work_item_masters" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subCategoryId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "standardPrice" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "requiredDays" INTEGER,
    "requiredWorkers" INTEGER,
    "productType" TEXT,
    "maker" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "work_item_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_log_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_log_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
    "ledgerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerId" TEXT,
    "workDate" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "memo" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "calendarEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "autoConvertEnabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultContractTemplate" TEXT NOT NULL DEFAULT 'construction',
    "mapEstimateItemsToContract" BOOLEAN NOT NULL DEFAULT true,
    "mapAmountToContract" BOOLEAN NOT NULL DEFAULT true,
    "mapDurationToContract" BOOLEAN NOT NULL DEFAULT true,
    "mapCustomerInfoToContract" BOOLEAN NOT NULL DEFAULT true,
    "requireApprovalForConversion" BOOLEAN NOT NULL DEFAULT true,
    "approvalFlowId" TEXT NOT NULL DEFAULT '',
    "orderDeadlineDays" INTEGER NOT NULL DEFAULT 7,
    "completionOrderCheckEnabled" BOOLEAN NOT NULL DEFAULT true,
    "completionOrderCheckLevel" TEXT NOT NULL DEFAULT 'warning',
    "completionMilestoneCheckEnabled" BOOLEAN NOT NULL DEFAULT true,
    "completionMilestoneCheckLevel" TEXT NOT NULL DEFAULT 'warning',
    "completionInvoiceCheckEnabled" BOOLEAN NOT NULL DEFAULT false,
    "completionInvoiceCheckLevel" TEXT NOT NULL DEFAULT 'warning',
    "completionInspectionCheckEnabled" BOOLEAN NOT NULL DEFAULT false,
    "completionInspectionCheckLevel" TEXT NOT NULL DEFAULT 'warning',
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ab_tests_status_idx" ON "ab_tests"("status");

-- CreateIndex
CREATE INDEX "ab_tests_tenantId_idx" ON "ab_tests"("tenantId");

-- CreateIndex
CREATE INDEX "account_mappings_tenantId_isActive_idx" ON "account_mappings"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "account_mappings_tenantId_provider_idx" ON "account_mappings"("tenantId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "account_mappings_tenantId_drmAccountCode_provider_key" ON "account_mappings"("tenantId", "drmAccountCode", "provider");

-- CreateIndex
CREATE INDEX "account_subject_master_category_idx" ON "account_subject_master"("category");

-- CreateIndex
CREATE INDEX "account_subject_master_displayOrder_idx" ON "account_subject_master"("displayOrder");

-- CreateIndex
CREATE INDEX "account_subject_master_isActive_idx" ON "account_subject_master"("isActive");

-- CreateIndex
CREATE INDEX "account_subject_master_level_idx" ON "account_subject_master"("level");

-- CreateIndex
CREATE INDEX "account_subject_master_parentCode_idx" ON "account_subject_master"("parentCode");

-- CreateIndex
CREATE INDEX "account_subject_master_tenantId_category_idx" ON "account_subject_master"("tenantId", "category");

-- CreateIndex
CREATE INDEX "account_subject_master_tenantId_idx" ON "account_subject_master"("tenantId");

-- CreateIndex
CREATE INDEX "account_subject_master_tenantId_level_idx" ON "account_subject_master"("tenantId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "account_subject_master_tenantId_code_key" ON "account_subject_master"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_integrations_tenantId_key" ON "accounting_integrations"("tenantId");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "activity_attachments_activityId_idx" ON "activity_attachments"("activityId");

-- CreateIndex
CREATE INDEX "activity_attachments_category_idx" ON "activity_attachments"("category");

-- CreateIndex
CREATE INDEX "activity_attachments_deletedAt_idx" ON "activity_attachments"("deletedAt");

-- CreateIndex
CREATE INDEX "activity_attachments_fileType_idx" ON "activity_attachments"("fileType");

-- CreateIndex
CREATE INDEX "activity_attachments_tenantId_idx" ON "activity_attachments"("tenantId");

-- CreateIndex
CREATE INDEX "activity_type_masters_category_idx" ON "activity_type_masters"("category");

-- CreateIndex
CREATE INDEX "activity_type_masters_displayOrder_idx" ON "activity_type_masters"("displayOrder");

-- CreateIndex
CREATE INDEX "activity_type_masters_isActive_idx" ON "activity_type_masters"("isActive");

-- CreateIndex
CREATE INDEX "activity_type_masters_tenantId_idx" ON "activity_type_masters"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_type_masters_tenantId_code_key" ON "activity_type_masters"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "admin_notification_settings_tenantId_key" ON "admin_notification_settings"("tenantId");

-- CreateIndex
CREATE INDEX "admin_notification_settings_tenantId_idx" ON "admin_notification_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "api_keys_isActive_idx" ON "api_keys"("isActive");

-- CreateIndex
CREATE INDEX "api_keys_keyHash_idx" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "api_keys_tenantId_idx" ON "api_keys"("tenantId");

-- CreateIndex
CREATE INDEX "api_metrics_endpoint_idx" ON "api_metrics"("endpoint");

-- CreateIndex
CREATE INDEX "api_metrics_tenantId_endpoint_idx" ON "api_metrics"("tenantId", "endpoint");

-- CreateIndex
CREATE INDEX "api_metrics_tenantId_idx" ON "api_metrics"("tenantId");

-- CreateIndex
CREATE INDEX "api_metrics_tenantId_timestamp_idx" ON "api_metrics"("tenantId", "timestamp");

-- CreateIndex
CREATE INDEX "api_metrics_timestamp_idx" ON "api_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "approval_actions_actionType_idx" ON "approval_actions"("actionType");

-- CreateIndex
CREATE INDEX "approval_actions_instanceId_idx" ON "approval_actions"("instanceId");

-- CreateIndex
CREATE INDEX "approval_condition_flowId_idx" ON "approval_condition"("flowId");

-- CreateIndex
CREATE INDEX "approval_flow_master_documentType_idx" ON "approval_flow_master"("documentType");

-- CreateIndex
CREATE INDEX "approval_flow_master_isActive_idx" ON "approval_flow_master"("isActive");

-- CreateIndex
CREATE INDEX "approval_flow_master_isDefault_idx" ON "approval_flow_master"("isDefault");

-- CreateIndex
CREATE INDEX "approval_flow_master_tenantId_documentType_idx" ON "approval_flow_master"("tenantId", "documentType");

-- CreateIndex
CREATE INDEX "approval_flow_master_tenantId_idx" ON "approval_flow_master"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "approval_flow_master_tenantId_name_key" ON "approval_flow_master"("tenantId", "name");

-- CreateIndex
CREATE INDEX "approval_instance_steps_instanceId_idx" ON "approval_instance_steps"("instanceId");

-- CreateIndex
CREATE INDEX "approval_instance_steps_status_idx" ON "approval_instance_steps"("status");

-- CreateIndex
CREATE UNIQUE INDEX "approval_instance_steps_instanceId_stepOrder_key" ON "approval_instance_steps"("instanceId", "stepOrder");

-- CreateIndex
CREATE INDEX "approval_instances_documentType_documentId_idx" ON "approval_instances"("documentType", "documentId");

-- CreateIndex
CREATE INDEX "approval_instances_flowId_idx" ON "approval_instances"("flowId");

-- CreateIndex
CREATE INDEX "approval_instances_requesterId_idx" ON "approval_instances"("requesterId");

-- CreateIndex
CREATE INDEX "approval_instances_status_idx" ON "approval_instances"("status");

-- CreateIndex
CREATE INDEX "approval_instances_tenantId_idx" ON "approval_instances"("tenantId");

-- CreateIndex
CREATE INDEX "approval_step_flowId_idx" ON "approval_step"("flowId");

-- CreateIndex
CREATE INDEX "approval_step_stepNumber_idx" ON "approval_step"("stepNumber");

-- CreateIndex
CREATE INDEX "assignment_history_assignedAt_idx" ON "assignment_history"("assignedAt");

-- CreateIndex
CREATE INDEX "assignment_history_customerId_idx" ON "assignment_history"("customerId");

-- CreateIndex
CREATE INDEX "assignment_history_opportunityId_idx" ON "assignment_history"("opportunityId");

-- CreateIndex
CREATE INDEX "assignment_history_tenantId_idx" ON "assignment_history"("tenantId");

-- CreateIndex
CREATE INDEX "assignment_history_toUserId_idx" ON "assignment_history"("toUserId");

-- CreateIndex
CREATE INDEX "audit_events_createdAt_idx" ON "audit_events"("createdAt");

-- CreateIndex
CREATE INDEX "audit_events_entityType_entityId_idx" ON "audit_events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_events_eventType_idx" ON "audit_events"("eventType");

-- CreateIndex
CREATE INDEX "audit_events_tenantId_idx" ON "audit_events"("tenantId");

-- CreateIndex
CREATE INDEX "audit_events_userId_idx" ON "audit_events"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "backup_history_backupSettingsId_idx" ON "backup_history"("backupSettingsId");

-- CreateIndex
CREATE INDEX "backup_history_backupStatus_idx" ON "backup_history"("backupStatus");

-- CreateIndex
CREATE INDEX "backup_history_startedAt_idx" ON "backup_history"("startedAt");

-- CreateIndex
CREATE INDEX "backup_history_tenantId_idx" ON "backup_history"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "backup_settings_tenantId_key" ON "backup_settings"("tenantId");

-- CreateIndex
CREATE INDEX "backup_settings_lastBackupAt_idx" ON "backup_settings"("lastBackupAt");

-- CreateIndex
CREATE INDEX "backup_settings_tenantId_idx" ON "backup_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_settings_tenantId_key" ON "billing_settings"("tenantId");

-- CreateIndex
CREATE INDEX "billing_settings_tenantId_idx" ON "billing_settings"("tenantId");

-- CreateIndex
CREATE INDEX "cache_metrics_namespace_idx" ON "cache_metrics"("namespace");

-- CreateIndex
CREATE INDEX "cache_metrics_tenantId_idx" ON "cache_metrics"("tenantId");

-- CreateIndex
CREATE INDEX "cache_metrics_tenantId_namespace_idx" ON "cache_metrics"("tenantId", "namespace");

-- CreateIndex
CREATE INDEX "cache_metrics_tenantId_timestamp_idx" ON "cache_metrics"("tenantId", "timestamp");

-- CreateIndex
CREATE INDEX "cache_metrics_timestamp_idx" ON "cache_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "campaigns_startDate_endDate_idx" ON "campaigns"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX "campaigns_tenantId_idx" ON "campaigns"("tenantId");

-- CreateIndex
CREATE INDEX "campaigns_tenantId_status_idx" ON "campaigns"("tenantId", "status");

-- CreateIndex
CREATE INDEX "campaigns_type_idx" ON "campaigns"("type");

-- CreateIndex
CREATE INDEX "case_attachments_caseId_idx" ON "case_attachments"("caseId");

-- CreateIndex
CREATE INDEX "case_events_caseId_idx" ON "case_events"("caseId");

-- CreateIndex
CREATE INDEX "case_events_createdAt_idx" ON "case_events"("createdAt");

-- CreateIndex
CREATE INDEX "case_events_type_idx" ON "case_events"("type");

-- CreateIndex
CREATE INDEX "case_relations_caseId_idx" ON "case_relations"("caseId");

-- CreateIndex
CREATE INDEX "case_relations_objectId_idx" ON "case_relations"("objectId");

-- CreateIndex
CREATE INDEX "case_relations_relationType_idx" ON "case_relations"("relationType");

-- CreateIndex
CREATE INDEX "case_watchers_caseId_idx" ON "case_watchers"("caseId");

-- CreateIndex
CREATE INDEX "case_watchers_userId_idx" ON "case_watchers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "case_watchers_caseId_userId_key" ON "case_watchers"("caseId", "userId");

-- CreateIndex
CREATE INDEX "cases_assigneeId_idx" ON "cases"("assigneeId");

-- CreateIndex
CREATE INDEX "cases_caseType_idx" ON "cases"("caseType");

-- CreateIndex
CREATE INDEX "cases_priority_idx" ON "cases"("priority");

-- CreateIndex
CREATE INDEX "cases_relatedCustomerId_idx" ON "cases"("relatedCustomerId");

-- CreateIndex
CREATE INDEX "cases_relatedProjectId_idx" ON "cases"("relatedProjectId");

-- CreateIndex
CREATE INDEX "cases_slaStatus_idx" ON "cases"("slaStatus");

-- CreateIndex
CREATE INDEX "cases_status_idx" ON "cases"("status");

-- CreateIndex
CREATE INDEX "cases_tenantId_assigneeId_idx" ON "cases"("tenantId", "assigneeId");

-- CreateIndex
CREATE INDEX "cases_tenantId_caseType_idx" ON "cases"("tenantId", "caseType");

-- CreateIndex
CREATE INDEX "cases_tenantId_idx" ON "cases"("tenantId");

-- CreateIndex
CREATE INDEX "cases_tenantId_status_idx" ON "cases"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "company_branding_tenantId_key" ON "company_branding"("tenantId");

-- CreateIndex
CREATE INDEX "company_branding_tenantId_idx" ON "company_branding"("tenantId");

-- CreateIndex
CREATE INDEX "construction_categories_displayOrder_idx" ON "construction_categories"("displayOrder");

-- CreateIndex
CREATE INDEX "construction_categories_isActive_idx" ON "construction_categories"("isActive");

-- CreateIndex
CREATE INDEX "construction_categories_tenantId_idx" ON "construction_categories"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "construction_categories_tenantId_code_key" ON "construction_categories"("tenantId", "code");

-- CreateIndex
CREATE INDEX "construction_ledgers_customerId_idx" ON "construction_ledgers"("customerId");

-- CreateIndex
CREATE INDEX "construction_ledgers_fiscalYear_idx" ON "construction_ledgers"("fiscalYear");

-- CreateIndex
CREATE INDEX "construction_ledgers_status_idx" ON "construction_ledgers"("status");

-- CreateIndex
CREATE INDEX "construction_ledgers_tenantId_createdAt_idx" ON "construction_ledgers"("tenantId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "construction_ledgers_tenantId_customerId_idx" ON "construction_ledgers"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "construction_ledgers_tenantId_idx" ON "construction_ledgers"("tenantId");

-- CreateIndex
CREATE INDEX "construction_ledgers_tenantId_status_fiscalYear_idx" ON "construction_ledgers"("tenantId", "status", "fiscalYear");

-- CreateIndex
CREATE UNIQUE INDEX "construction_ledgers_tenantId_ledgerNo_key" ON "construction_ledgers"("tenantId", "ledgerNo");

-- CreateIndex
CREATE INDEX "construction_phases_ledgerId_idx" ON "construction_phases"("ledgerId");

-- CreateIndex
CREATE INDEX "construction_phases_tenantId_idx" ON "construction_phases"("tenantId");

-- CreateIndex
CREATE INDEX "construction_phases_tenantId_ledgerId_displayOrder_idx" ON "construction_phases"("tenantId", "ledgerId", "displayOrder");

-- CreateIndex
CREATE INDEX "construction_sub_categories_categoryId_idx" ON "construction_sub_categories"("categoryId");

-- CreateIndex
CREATE INDEX "construction_sub_categories_displayOrder_idx" ON "construction_sub_categories"("displayOrder");

-- CreateIndex
CREATE INDEX "construction_sub_categories_isActive_idx" ON "construction_sub_categories"("isActive");

-- CreateIndex
CREATE INDEX "construction_sub_categories_tenantId_idx" ON "construction_sub_categories"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "construction_sub_categories_tenantId_code_key" ON "construction_sub_categories"("tenantId", "code");

-- CreateIndex
CREATE INDEX "contacts_customerId_idx" ON "contacts"("customerId");

-- CreateIndex
CREATE INDEX "contacts_deletedAt_idx" ON "contacts"("deletedAt");

-- CreateIndex
CREATE INDEX "contacts_tenantId_email_idx" ON "contacts"("tenantId", "email");

-- CreateIndex
CREATE INDEX "contacts_tenantId_idx" ON "contacts"("tenantId");

-- CreateIndex
CREATE INDEX "contacts_tenantId_phone_idx" ON "contacts"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "contract_changes_ledgerId_idx" ON "contract_changes"("ledgerId");

-- CreateIndex
CREATE INDEX "contract_changes_originalContractId_idx" ON "contract_changes"("originalContractId");

-- CreateIndex
CREATE INDEX "contract_changes_status_idx" ON "contract_changes"("status");

-- CreateIndex
CREATE INDEX "contract_changes_tenantId_idx" ON "contract_changes"("tenantId");

-- CreateIndex
CREATE INDEX "contract_changes_tenantId_ledgerId_status_idx" ON "contract_changes"("tenantId", "ledgerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "contract_changes_tenantId_changeNo_key" ON "contract_changes"("tenantId", "changeNo");

-- CreateIndex
CREATE INDEX "contract_inspections_contractId_idx" ON "contract_inspections"("contractId");

-- CreateIndex
CREATE INDEX "contract_inspections_customerId_idx" ON "contract_inspections"("customerId");

-- CreateIndex
CREATE INDEX "contract_inspections_scheduledDate_idx" ON "contract_inspections"("scheduledDate");

-- CreateIndex
CREATE INDEX "contract_inspections_status_idx" ON "contract_inspections"("status");

-- CreateIndex
CREATE INDEX "contract_inspections_tenantId_idx" ON "contract_inspections"("tenantId");

-- CreateIndex
CREATE INDEX "contracts_contractNo_idx" ON "contracts"("contractNo");

-- CreateIndex
CREATE INDEX "contracts_customerId_idx" ON "contracts"("customerId");

-- CreateIndex
CREATE INDEX "contracts_inspectionPlanId_idx" ON "contracts"("inspectionPlanId");

-- CreateIndex
CREATE INDEX "contracts_ledgerId_idx" ON "contracts"("ledgerId");

-- CreateIndex
CREATE INDEX "contracts_tenantId_idx" ON "contracts"("tenantId");

-- CreateIndex
CREATE INDEX "contracts_tenantId_status_createdAt_idx" ON "contracts"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "cost_settings_tenantId_key" ON "cost_settings"("tenantId");

-- CreateIndex
CREATE INDEX "cost_settings_tenantId_idx" ON "cost_settings"("tenantId");

-- CreateIndex
CREATE INDEX "cost_subject_master_category_idx" ON "cost_subject_master"("category");

-- CreateIndex
CREATE INDEX "cost_subject_master_displayOrder_idx" ON "cost_subject_master"("displayOrder");

-- CreateIndex
CREATE INDEX "cost_subject_master_isActive_idx" ON "cost_subject_master"("isActive");

-- CreateIndex
CREATE INDEX "cost_subject_master_tenantId_category_idx" ON "cost_subject_master"("tenantId", "category");

-- CreateIndex
CREATE INDEX "cost_subject_master_tenantId_idx" ON "cost_subject_master"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "cost_subject_master_tenantId_code_key" ON "cost_subject_master"("tenantId", "code");

-- CreateIndex
CREATE INDEX "customer_activities_createdAt_idx" ON "customer_activities"("createdAt");

-- CreateIndex
CREATE INDEX "customer_activities_customerId_idx" ON "customer_activities"("customerId");

-- CreateIndex
CREATE INDEX "customer_activities_tenantId_idx" ON "customer_activities"("tenantId");

-- CreateIndex
CREATE INDEX "customer_activities_type_idx" ON "customer_activities"("type");

-- CreateIndex
CREATE UNIQUE INDEX "customer_building_info_customerId_key" ON "customer_building_info"("customerId");

-- CreateIndex
CREATE INDEX "customer_building_info_customerId_idx" ON "customer_building_info"("customerId");

-- CreateIndex
CREATE INDEX "customer_building_info_tenantId_idx" ON "customer_building_info"("tenantId");

-- CreateIndex
CREATE INDEX "customer_equipment_category_idx" ON "customer_equipment"("category");

-- CreateIndex
CREATE INDEX "customer_equipment_customerId_idx" ON "customer_equipment"("customerId");

-- CreateIndex
CREATE INDEX "customer_equipment_tenantId_idx" ON "customer_equipment"("tenantId");

-- CreateIndex
CREATE INDEX "customer_family_members_customerId_idx" ON "customer_family_members"("customerId");

-- CreateIndex
CREATE INDEX "customer_family_members_linkedCustomerId_idx" ON "customer_family_members"("linkedCustomerId");

-- CreateIndex
CREATE INDEX "customer_family_members_tenantId_idx" ON "customer_family_members"("tenantId");

-- CreateIndex
CREATE INDEX "customer_merge_events_sourceCustomerId_idx" ON "customer_merge_events"("sourceCustomerId");

-- CreateIndex
CREATE INDEX "customer_merge_events_targetCustomerId_idx" ON "customer_merge_events"("targetCustomerId");

-- CreateIndex
CREATE INDEX "customer_merge_events_tenantId_idx" ON "customer_merge_events"("tenantId");

-- CreateIndex
CREATE INDEX "customer_referrals_referredId_idx" ON "customer_referrals"("referredId");

-- CreateIndex
CREATE INDEX "customer_referrals_referrerId_idx" ON "customer_referrals"("referrerId");

-- CreateIndex
CREATE INDEX "customer_referrals_tenantId_idx" ON "customer_referrals"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_referrals_referrerId_referredId_key" ON "customer_referrals"("referrerId", "referredId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_settings_tenantId_key" ON "customer_settings"("tenantId");

-- CreateIndex
CREATE INDEX "customer_settings_tenantId_idx" ON "customer_settings"("tenantId");

-- CreateIndex
CREATE INDEX "customer_tags_customerId_idx" ON "customer_tags"("customerId");

-- CreateIndex
CREATE INDEX "customer_tags_tagId_idx" ON "customer_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_tags_customerId_tagId_key" ON "customer_tags"("customerId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customerNo_key" ON "customers"("customerNo");

-- CreateIndex
CREATE INDEX "customers_assignedToId_idx" ON "customers"("assignedToId");

-- CreateIndex
CREATE INDEX "customers_customerNo_idx" ON "customers"("customerNo");

-- CreateIndex
CREATE INDEX "customers_deletedAt_idx" ON "customers"("deletedAt");

-- CreateIndex
CREATE INDEX "customers_tenantId_assignedToId_idx" ON "customers"("tenantId", "assignedToId");

-- CreateIndex
CREATE INDEX "customers_tenantId_companyName_idx" ON "customers"("tenantId", "companyName");

-- CreateIndex
CREATE INDEX "customers_tenantId_deletedAt_updatedAt_idx" ON "customers"("tenantId", "deletedAt", "updatedAt");

-- CreateIndex
CREATE INDEX "customers_tenantId_idx" ON "customers"("tenantId");

-- CreateIndex
CREATE INDEX "customers_tenantId_nameKana_idx" ON "customers"("tenantId", "nameKana");

-- CreateIndex
CREATE INDEX "customers_tenantId_name_idx" ON "customers"("tenantId", "name");

-- CreateIndex
CREATE INDEX "customers_tenantId_status_idx" ON "customers"("tenantId", "status");

-- CreateIndex
CREATE INDEX "customers_tenantId_status_rank_idx" ON "customers"("tenantId", "status", "rank");

-- CreateIndex
CREATE INDEX "customers_tenantId_updatedAt_idx" ON "customers"("tenantId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_access_settings_tenantId_key" ON "dashboard_access_settings"("tenantId");

-- CreateIndex
CREATE INDEX "dashboard_access_settings_tenantId_idx" ON "dashboard_access_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_settings_tenantId_key" ON "dashboard_settings"("tenantId");

-- CreateIndex
CREATE INDEX "dashboard_settings_tenantId_idx" ON "dashboard_settings"("tenantId");

-- CreateIndex
CREATE INDEX "department_master_isActive_idx" ON "department_master"("isActive");

-- CreateIndex
CREATE INDEX "department_master_parentCode_idx" ON "department_master"("parentCode");

-- CreateIndex
CREATE INDEX "department_master_tenantId_idx" ON "department_master"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "department_master_tenantId_code_key" ON "department_master"("tenantId", "code");

-- CreateIndex
CREATE INDEX "departments_isActive_idx" ON "departments"("isActive");

-- CreateIndex
CREATE INDEX "departments_level_idx" ON "departments"("level");

-- CreateIndex
CREATE INDEX "departments_parentId_idx" ON "departments"("parentId");

-- CreateIndex
CREATE INDEX "departments_tenantId_idx" ON "departments"("tenantId");

-- CreateIndex
CREATE INDEX "departments_type_idx" ON "departments"("type");

-- CreateIndex
CREATE UNIQUE INDEX "departments_tenantId_code_key" ON "departments"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "documents_dwDocumentId_key" ON "documents"("dwDocumentId");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "documents"("category");

-- CreateIndex
CREATE INDEX "documents_contractId_idx" ON "documents"("contractId");

-- CreateIndex
CREATE INDEX "documents_dwDocumentId_idx" ON "documents"("dwDocumentId");

-- CreateIndex
CREATE INDEX "documents_dwSyncStatus_idx" ON "documents"("dwSyncStatus");

-- CreateIndex
CREATE INDEX "documents_estimateId_idx" ON "documents"("estimateId");

-- CreateIndex
CREATE INDEX "documents_ledgerId_idx" ON "documents"("ledgerId");

-- CreateIndex
CREATE INDEX "documents_orderId_idx" ON "documents"("orderId");

-- CreateIndex
CREATE INDEX "documents_tenantId_idx" ON "documents"("tenantId");

-- CreateIndex
CREATE INDEX "equipments_category_idx" ON "equipments"("category");

-- CreateIndex
CREATE INDEX "equipments_deletedAt_idx" ON "equipments"("deletedAt");

-- CreateIndex
CREATE INDEX "equipments_installedAt_idx" ON "equipments"("installedAt");

-- CreateIndex
CREATE INDEX "equipments_isReplaced_idx" ON "equipments"("isReplaced");

-- CreateIndex
CREATE INDEX "equipments_manufacturer_idx" ON "equipments"("manufacturer");

-- CreateIndex
CREATE INDEX "equipments_propertyId_idx" ON "equipments"("propertyId");

-- CreateIndex
CREATE INDEX "equipments_tenantId_idx" ON "equipments"("tenantId");

-- CreateIndex
CREATE INDEX "estimate_templates_tenantId_category_idx" ON "estimate_templates"("tenantId", "category");

-- CreateIndex
CREATE INDEX "estimate_templates_tenantId_createdBy_idx" ON "estimate_templates"("tenantId", "createdBy");

-- CreateIndex
CREATE INDEX "estimate_templates_tenantId_scope_idx" ON "estimate_templates"("tenantId", "scope");

-- CreateIndex
CREATE INDEX "estimates_customerId_idx" ON "estimates"("customerId");

-- CreateIndex
CREATE INDEX "estimates_opportunityId_idx" ON "estimates"("opportunityId");

-- CreateIndex
CREATE INDEX "estimates_status_idx" ON "estimates"("status");

-- CreateIndex
CREATE INDEX "estimates_tenantId_customerId_idx" ON "estimates"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "estimates_tenantId_idx" ON "estimates"("tenantId");

-- CreateIndex
CREATE INDEX "estimates_tenantId_opportunityId_idx" ON "estimates"("tenantId", "opportunityId");

-- CreateIndex
CREATE INDEX "estimates_tenantId_type_idx" ON "estimates"("tenantId", "type");

-- CreateIndex
CREATE INDEX "estimates_type_idx" ON "estimates"("type");

-- CreateIndex
CREATE INDEX "expense_budgets_fiscalYear_month_idx" ON "expense_budgets"("fiscalYear", "month");

-- CreateIndex
CREATE INDEX "expense_budgets_tenantId_idx" ON "expense_budgets"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_budgets_tenantId_fiscalYear_month_categoryId_key" ON "expense_budgets"("tenantId", "fiscalYear", "month", "categoryId");

-- CreateIndex
CREATE INDEX "expense_categories_code_idx" ON "expense_categories"("code");

-- CreateIndex
CREATE INDEX "expense_categories_tenantId_idx" ON "expense_categories"("tenantId");

-- CreateIndex
CREATE INDEX "expense_categories_type_idx" ON "expense_categories"("type");

-- CreateIndex
CREATE INDEX "feedback_attachments_feedbackId_idx" ON "feedback_attachments"("feedbackId");

-- CreateIndex
CREATE INDEX "feedback_comments_authorId_idx" ON "feedback_comments"("authorId");

-- CreateIndex
CREATE INDEX "feedback_comments_feedbackId_idx" ON "feedback_comments"("feedbackId");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_upvotes_feedbackId_userId_key" ON "feedback_upvotes"("feedbackId", "userId");

-- CreateIndex
CREATE INDEX "feedbacks_createdAt_idx" ON "feedbacks"("createdAt");

-- CreateIndex
CREATE INDEX "feedbacks_reporterId_idx" ON "feedbacks"("reporterId");

-- CreateIndex
CREATE INDEX "feedbacks_status_idx" ON "feedbacks"("status");

-- CreateIndex
CREATE INDEX "feedbacks_tenantId_idx" ON "feedbacks"("tenantId");

-- CreateIndex
CREATE INDEX "feedbacks_type_idx" ON "feedbacks"("type");

-- CreateIndex
CREATE INDEX "financial_plan_categories_tenantId_displayOrder_idx" ON "financial_plan_categories"("tenantId", "displayOrder");

-- CreateIndex
CREATE INDEX "financial_plan_categories_tenantId_idx" ON "financial_plan_categories"("tenantId");

-- CreateIndex
CREATE INDEX "financial_plan_category_items_categoryId_displayOrder_idx" ON "financial_plan_category_items"("categoryId", "displayOrder");

-- CreateIndex
CREATE INDEX "financial_plan_category_items_categoryId_idx" ON "financial_plan_category_items"("categoryId");

-- CreateIndex
CREATE INDEX "financial_plan_cost_details_financialPlanId_idx" ON "financial_plan_cost_details"("financialPlanId");

-- CreateIndex
CREATE INDEX "financial_plan_cost_details_itemCategory_idx" ON "financial_plan_cost_details"("itemCategory");

-- CreateIndex
CREATE INDEX "financial_plans_customerId_idx" ON "financial_plans"("customerId");

-- CreateIndex
CREATE INDEX "financial_plans_status_idx" ON "financial_plans"("status");

-- CreateIndex
CREATE INDEX "financial_plans_tenantId_customerId_idx" ON "financial_plans"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "financial_plans_tenantId_idx" ON "financial_plans"("tenantId");

-- CreateIndex
CREATE INDEX "full_reno_estimate_customerId_idx" ON "full_reno_estimate"("customerId");

-- CreateIndex
CREATE INDEX "full_reno_estimate_status_idx" ON "full_reno_estimate"("status");

-- CreateIndex
CREATE INDEX "full_reno_estimate_tenantId_idx" ON "full_reno_estimate"("tenantId");

-- CreateIndex
CREATE INDEX "full_reno_room_estimateId_idx" ON "full_reno_room"("estimateId");

-- CreateIndex
CREATE INDEX "full_reno_room_opening_openingMasterId_idx" ON "full_reno_room_opening"("openingMasterId");

-- CreateIndex
CREATE INDEX "full_reno_room_opening_roomId_idx" ON "full_reno_room_opening"("roomId");

-- CreateIndex
CREATE INDEX "full_reno_work_item_estimateId_idx" ON "full_reno_work_item"("estimateId");

-- CreateIndex
CREATE INDEX "full_reno_work_item_roomId_idx" ON "full_reno_work_item"("roomId");

-- CreateIndex
CREATE INDEX "full_reno_work_item_workItemMasterId_idx" ON "full_reno_work_item"("workItemMasterId");

-- CreateIndex
CREATE INDEX "full_reno_work_item_master_calculationBasis_idx" ON "full_reno_work_item_master"("calculationBasis");

-- CreateIndex
CREATE INDEX "full_reno_work_item_master_categoryId_idx" ON "full_reno_work_item_master"("categoryId");

-- CreateIndex
CREATE INDEX "full_reno_work_item_master_tenantId_idx" ON "full_reno_work_item_master"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "full_reno_work_item_master_tenantId_code_key" ON "full_reno_work_item_master"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "google_calendar_integrations_userId_key" ON "google_calendar_integrations"("userId");

-- CreateIndex
CREATE INDEX "google_calendar_integrations_isActive_idx" ON "google_calendar_integrations"("isActive");

-- CreateIndex
CREATE INDEX "google_calendar_integrations_userId_idx" ON "google_calendar_integrations"("userId");

-- CreateIndex
CREATE INDEX "hierarchical_targets_fiscalYear_idx" ON "hierarchical_targets"("fiscalYear");

-- CreateIndex
CREATE INDEX "hierarchical_targets_level_idx" ON "hierarchical_targets"("level");

-- CreateIndex
CREATE INDEX "hierarchical_targets_parentId_idx" ON "hierarchical_targets"("parentId");

-- CreateIndex
CREATE INDEX "hierarchical_targets_tenantId_fiscalYear_level_idx" ON "hierarchical_targets"("tenantId", "fiscalYear", "level");

-- CreateIndex
CREATE INDEX "hierarchical_targets_tenantId_idx" ON "hierarchical_targets"("tenantId");

-- CreateIndex
CREATE INDEX "inspection_plan_steps_planId_idx" ON "inspection_plan_steps"("planId");

-- CreateIndex
CREATE INDEX "inspection_plans_category_idx" ON "inspection_plans"("category");

-- CreateIndex
CREATE INDEX "inspection_plans_isActive_idx" ON "inspection_plans"("isActive");

-- CreateIndex
CREATE INDEX "inspection_plans_tenantId_idx" ON "inspection_plans"("tenantId");

-- CreateIndex
CREATE INDEX "invoices_contractId_idx" ON "invoices"("contractId");

-- CreateIndex
CREATE INDEX "invoices_customerId_idx" ON "invoices"("customerId");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");

-- CreateIndex
CREATE INDEX "invoices_paymentStatus_idx" ON "invoices"("paymentStatus");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_tenantId_customerId_idx" ON "invoices"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "invoices_tenantId_idx" ON "invoices"("tenantId");

-- CreateIndex
CREATE INDEX "invoices_tenantId_status_dueDate_idx" ON "invoices"("tenantId", "status", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenantId_idempotencyKey_key" ON "invoices"("tenantId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenantId_invoiceNo_key" ON "invoices"("tenantId", "invoiceNo");

-- CreateIndex
CREATE INDEX "journal_sync_logs_tenantId_provider_idx" ON "journal_sync_logs"("tenantId", "provider");

-- CreateIndex
CREATE INDEX "journal_sync_logs_tenantId_startedAt_idx" ON "journal_sync_logs"("tenantId", "startedAt");

-- CreateIndex
CREATE INDEX "journal_sync_logs_tenantId_syncType_status_idx" ON "journal_sync_logs"("tenantId", "syncType", "status");

-- CreateIndex
CREATE INDEX "journal_sync_queue_sourceTable_sourceId_idx" ON "journal_sync_queue"("sourceTable", "sourceId");

-- CreateIndex
CREATE INDEX "journal_sync_queue_status_priority_scheduledAt_idx" ON "journal_sync_queue"("status", "priority", "scheduledAt");

-- CreateIndex
CREATE INDEX "journal_sync_queue_tenantId_provider_status_idx" ON "journal_sync_queue"("tenantId", "provider", "status");

-- CreateIndex
CREATE INDEX "journeys_status_idx" ON "journeys"("status");

-- CreateIndex
CREATE INDEX "journeys_tenantId_idx" ON "journeys"("tenantId");

-- CreateIndex
CREATE INDEX "leads_score_idx" ON "leads"("score");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_tenantId_idx" ON "leads"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_tenantId_email_key" ON "leads"("tenantId", "email");

-- CreateIndex
CREATE INDEX "ledger_expenses_accountSubjectId_idx" ON "ledger_expenses"("accountSubjectId");

-- CreateIndex
CREATE INDEX "ledger_expenses_category_idx" ON "ledger_expenses"("category");

-- CreateIndex
CREATE INDEX "ledger_expenses_expenseDate_idx" ON "ledger_expenses"("expenseDate");

-- CreateIndex
CREATE INDEX "ledger_expenses_ledgerId_idx" ON "ledger_expenses"("ledgerId");

-- CreateIndex
CREATE INDEX "ledger_expenses_tenantId_idx" ON "ledger_expenses"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_expenses_tenantId_expenseNo_key" ON "ledger_expenses"("tenantId", "expenseNo");

-- CreateIndex
CREATE INDEX "ma_ab_tests_status_idx" ON "ma_ab_tests"("status");

-- CreateIndex
CREATE INDEX "ma_ab_tests_tenantId_idx" ON "ma_ab_tests"("tenantId");

-- CreateIndex
CREATE INDEX "ma_auto_assignment_rules_isActive_idx" ON "ma_auto_assignment_rules"("isActive");

-- CreateIndex
CREATE INDEX "ma_auto_assignment_rules_priority_idx" ON "ma_auto_assignment_rules"("priority");

-- CreateIndex
CREATE INDEX "ma_auto_assignment_rules_tenantId_idx" ON "ma_auto_assignment_rules"("tenantId");

-- CreateIndex
CREATE INDEX "ma_calendar_events_date_idx" ON "ma_calendar_events"("date");

-- CreateIndex
CREATE INDEX "ma_calendar_events_status_idx" ON "ma_calendar_events"("status");

-- CreateIndex
CREATE INDEX "ma_calendar_events_tenantId_idx" ON "ma_calendar_events"("tenantId");

-- CreateIndex
CREATE INDEX "ma_calendar_events_type_idx" ON "ma_calendar_events"("type");

-- CreateIndex
CREATE INDEX "ma_conversions_convertedAt_idx" ON "ma_conversions"("convertedAt");

-- CreateIndex
CREATE INDEX "ma_conversions_leadId_idx" ON "ma_conversions"("leadId");

-- CreateIndex
CREATE INDEX "ma_conversions_tenantId_idx" ON "ma_conversions"("tenantId");

-- CreateIndex
CREATE INDEX "ma_conversions_type_idx" ON "ma_conversions"("type");

-- CreateIndex
CREATE INDEX "ma_email_templates_category_idx" ON "ma_email_templates"("category");

-- CreateIndex
CREATE INDEX "ma_email_templates_status_idx" ON "ma_email_templates"("status");

-- CreateIndex
CREATE INDEX "ma_email_templates_tenantId_idx" ON "ma_email_templates"("tenantId");

-- CreateIndex
CREATE INDEX "ma_email_tracking_emailId_idx" ON "ma_email_tracking"("emailId");

-- CreateIndex
CREATE INDEX "ma_email_tracking_leadId_idx" ON "ma_email_tracking"("leadId");

-- CreateIndex
CREATE INDEX "ma_email_tracking_recipientEmail_idx" ON "ma_email_tracking"("recipientEmail");

-- CreateIndex
CREATE INDEX "ma_emails_scheduledAt_idx" ON "ma_emails"("scheduledAt");

-- CreateIndex
CREATE INDEX "ma_emails_status_idx" ON "ma_emails"("status");

-- CreateIndex
CREATE INDEX "ma_emails_tenantId_createdAt_idx" ON "ma_emails"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ma_emails_tenantId_idx" ON "ma_emails"("tenantId");

-- CreateIndex
CREATE INDEX "ma_emails_tenantId_status_idx" ON "ma_emails"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ma_journey_executions_journeyId_idx" ON "ma_journey_executions"("journeyId");

-- CreateIndex
CREATE INDEX "ma_journey_executions_journeyId_startedAt_idx" ON "ma_journey_executions"("journeyId", "startedAt");

-- CreateIndex
CREATE INDEX "ma_journey_executions_leadId_idx" ON "ma_journey_executions"("leadId");

-- CreateIndex
CREATE INDEX "ma_journey_executions_status_idx" ON "ma_journey_executions"("status");

-- CreateIndex
CREATE INDEX "ma_journey_executions_tenantId_idx" ON "ma_journey_executions"("tenantId");

-- CreateIndex
CREATE INDEX "ma_journey_executions_tenantId_journeyId_leadId_idx" ON "ma_journey_executions"("tenantId", "journeyId", "leadId");

-- CreateIndex
CREATE INDEX "ma_journeys_status_idx" ON "ma_journeys"("status");

-- CreateIndex
CREATE INDEX "ma_journeys_tenantId_idx" ON "ma_journeys"("tenantId");

-- CreateIndex
CREATE INDEX "ma_lead_duplicates_sourceLeadId_idx" ON "ma_lead_duplicates"("sourceLeadId");

-- CreateIndex
CREATE INDEX "ma_lead_duplicates_status_idx" ON "ma_lead_duplicates"("status");

-- CreateIndex
CREATE INDEX "ma_lead_duplicates_targetLeadId_idx" ON "ma_lead_duplicates"("targetLeadId");

-- CreateIndex
CREATE INDEX "ma_lead_duplicates_tenantId_idx" ON "ma_lead_duplicates"("tenantId");

-- CreateIndex
CREATE INDEX "ma_leads_assignedTo_idx" ON "ma_leads"("assignedTo");

-- CreateIndex
CREATE INDEX "ma_leads_convertedAt_idx" ON "ma_leads"("convertedAt");

-- CreateIndex
CREATE INDEX "ma_leads_createdAt_idx" ON "ma_leads"("createdAt");

-- CreateIndex
CREATE INDEX "ma_leads_customerId_idx" ON "ma_leads"("customerId");

-- CreateIndex
CREATE INDEX "ma_leads_priority_idx" ON "ma_leads"("priority");

-- CreateIndex
CREATE INDEX "ma_leads_propertyId_idx" ON "ma_leads"("propertyId");

-- CreateIndex
CREATE INDEX "ma_leads_responseDeadline_idx" ON "ma_leads"("responseDeadline");

-- CreateIndex
CREATE INDEX "ma_leads_source_idx" ON "ma_leads"("source");

-- CreateIndex
CREATE INDEX "ma_leads_status_idx" ON "ma_leads"("status");

-- CreateIndex
CREATE INDEX "ma_leads_tenantId_customerEmail_idx" ON "ma_leads"("tenantId", "customerEmail");

-- CreateIndex
CREATE INDEX "ma_leads_tenantId_customerPhone_idx" ON "ma_leads"("tenantId", "customerPhone");

-- CreateIndex
CREATE INDEX "ma_leads_tenantId_duplicateCheckHash_idx" ON "ma_leads"("tenantId", "duplicateCheckHash");

-- CreateIndex
CREATE INDEX "ma_leads_tenantId_idx" ON "ma_leads"("tenantId");

-- CreateIndex
CREATE INDEX "ma_leads_tenantId_postalCode_prefecture_city_idx" ON "ma_leads"("tenantId", "postalCode", "prefecture", "city");

-- CreateIndex
CREATE INDEX "ma_leads_tenantId_status_convertedAt_idx" ON "ma_leads"("tenantId", "status", "convertedAt");

-- CreateIndex
CREATE INDEX "ma_leads_urgency_idx" ON "ma_leads"("urgency");

-- CreateIndex
CREATE INDEX "ma_segments_status_idx" ON "ma_segments"("status");

-- CreateIndex
CREATE INDEX "ma_segments_tenantId_idx" ON "ma_segments"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ma_settings_tenantId_key" ON "ma_settings"("tenantId");

-- CreateIndex
CREATE INDEX "ma_settings_tenantId_idx" ON "ma_settings"("tenantId");

-- CreateIndex
CREATE INDEX "ma_webforms_status_idx" ON "ma_webforms"("status");

-- CreateIndex
CREATE INDEX "ma_webforms_tenantId_idx" ON "ma_webforms"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_settings_tenantId_key" ON "marketing_settings"("tenantId");

-- CreateIndex
CREATE INDEX "marketing_settings_tenantId_idx" ON "marketing_settings"("tenantId");

-- CreateIndex
CREATE INDEX "milestones_contractId_idx" ON "milestones"("contractId");

-- CreateIndex
CREATE INDEX "milestones_status_idx" ON "milestones"("status");

-- CreateIndex
CREATE INDEX "monthly_cash_balances_tenantId_idx" ON "monthly_cash_balances"("tenantId");

-- CreateIndex
CREATE INDEX "monthly_cash_balances_yearMonth_idx" ON "monthly_cash_balances"("yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_cash_balances_tenantId_yearMonth_key" ON "monthly_cash_balances"("tenantId", "yearMonth");

-- CreateIndex
CREATE INDEX "monthly_expense_forecasts_categoryId_idx" ON "monthly_expense_forecasts"("categoryId");

-- CreateIndex
CREATE INDEX "monthly_expense_forecasts_status_idx" ON "monthly_expense_forecasts"("status");

-- CreateIndex
CREATE INDEX "monthly_expense_forecasts_tenantId_idx" ON "monthly_expense_forecasts"("tenantId");

-- CreateIndex
CREATE INDEX "monthly_expense_forecasts_yearMonth_idx" ON "monthly_expense_forecasts"("yearMonth");

-- CreateIndex
CREATE INDEX "monthly_expenses_fiscalYear_month_idx" ON "monthly_expenses"("fiscalYear", "month");

-- CreateIndex
CREATE INDEX "monthly_expenses_tenantId_categoryId_idx" ON "monthly_expenses"("tenantId", "categoryId");

-- CreateIndex
CREATE INDEX "monthly_expenses_tenantId_idx" ON "monthly_expenses"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_expenses_tenantId_fiscalYear_month_categoryId_key" ON "monthly_expenses"("tenantId", "fiscalYear", "month", "categoryId");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_tenantId_idx" ON "notifications"("tenantId");

-- CreateIndex
CREATE INDEX "notifications_tenantId_userId_status_idx" ON "notifications"("tenantId", "userId", "status");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "opening_master_openingType_idx" ON "opening_master"("openingType");

-- CreateIndex
CREATE INDEX "opening_master_tenantId_idx" ON "opening_master"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "opening_master_tenantId_code_key" ON "opening_master"("tenantId", "code");

-- CreateIndex
CREATE INDEX "opportunities_assignedToId_idx" ON "opportunities"("assignedToId");

-- CreateIndex
CREATE INDEX "opportunities_customerId_idx" ON "opportunities"("customerId");

-- CreateIndex
CREATE INDEX "opportunities_deletedAt_idx" ON "opportunities"("deletedAt");

-- CreateIndex
CREATE INDEX "opportunities_departmentId_idx" ON "opportunities"("departmentId");

-- CreateIndex
CREATE INDEX "opportunities_expectedCloseDate_idx" ON "opportunities"("expectedCloseDate");

-- CreateIndex
CREATE INDEX "opportunities_rank_idx" ON "opportunities"("rank");

-- CreateIndex
CREATE INDEX "opportunities_stage_idx" ON "opportunities"("stage");

-- CreateIndex
CREATE INDEX "opportunities_status_idx" ON "opportunities"("status");

-- CreateIndex
CREATE INDEX "opportunities_tenantId_idx" ON "opportunities"("tenantId");

-- CreateIndex
CREATE INDEX "option_work_masters_tenantId_idx" ON "option_work_masters"("tenantId");

-- CreateIndex
CREATE INDEX "option_work_masters_tenantId_isActive_idx" ON "option_work_masters"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "orders_accountSubjectId_idx" ON "orders"("accountSubjectId");

-- CreateIndex
CREATE INDEX "orders_contractId_idx" ON "orders"("contractId");

-- CreateIndex
CREATE INDEX "orders_ledgerId_idx" ON "orders"("ledgerId");

-- CreateIndex
CREATE INDEX "orders_ledgerId_status_idx" ON "orders"("ledgerId", "status");

-- CreateIndex
CREATE INDEX "orders_partnerId_idx" ON "orders"("partnerId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_tenantId_dwSyncStatus_idx" ON "orders"("tenantId", "dwSyncStatus");

-- CreateIndex
CREATE INDEX "orders_tenantId_idx" ON "orders"("tenantId");

-- CreateIndex
CREATE INDEX "orders_tenantId_partnerId_idx" ON "orders"("tenantId", "partnerId");

-- CreateIndex
CREATE INDEX "orders_tenantId_status_dwSyncStatus_idx" ON "orders"("tenantId", "status", "dwSyncStatus");

-- CreateIndex
CREATE UNIQUE INDEX "orders_tenantId_orderNo_key" ON "orders"("tenantId", "orderNo");

-- CreateIndex
CREATE INDEX "ordinary_profit_targets_tenantId_idx" ON "ordinary_profit_targets"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ordinary_profit_targets_tenantId_fiscalYear_key" ON "ordinary_profit_targets"("tenantId", "fiscalYear");

-- CreateIndex
CREATE INDEX "partner_mappings_tenantId_provider_idx" ON "partner_mappings"("tenantId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "partner_mappings_tenantId_drmPartnerId_provider_key" ON "partner_mappings"("tenantId", "drmPartnerId", "provider");

-- CreateIndex
CREATE INDEX "partner_master_category_idx" ON "partner_master"("category");

-- CreateIndex
CREATE INDEX "partner_master_dwPartnerId_idx" ON "partner_master"("dwPartnerId");

-- CreateIndex
CREATE INDEX "partner_master_dwSyncStatus_idx" ON "partner_master"("dwSyncStatus");

-- CreateIndex
CREATE INDEX "partner_master_rating_idx" ON "partner_master"("rating");

-- CreateIndex
CREATE INDEX "partner_master_status_idx" ON "partner_master"("status");

-- CreateIndex
CREATE INDEX "partner_master_tenantId_category_idx" ON "partner_master"("tenantId", "category");

-- CreateIndex
CREATE INDEX "partner_master_tenantId_dwPartnerId_idx" ON "partner_master"("tenantId", "dwPartnerId");

-- CreateIndex
CREATE INDEX "partner_master_tenantId_idx" ON "partner_master"("tenantId");

-- CreateIndex
CREATE INDEX "partner_master_tenantId_status_idx" ON "partner_master"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "partner_master_tenantId_code_key" ON "partner_master"("tenantId", "code");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_tenantId_idx" ON "payments"("tenantId");

-- CreateIndex
CREATE INDEX "payments_tenantId_invoiceId_idx" ON "payments"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "payments_tenantId_status_paymentDate_idx" ON "payments"("tenantId", "status", "paymentDate");

-- CreateIndex
CREATE INDEX "pdf_assets_tenantId_idx" ON "pdf_assets"("tenantId");

-- CreateIndex
CREATE INDEX "pdf_assets_type_idx" ON "pdf_assets"("type");

-- CreateIndex
CREATE INDEX "pdf_templates_documentType_idx" ON "pdf_templates"("documentType");

-- CreateIndex
CREATE INDEX "pdf_templates_status_idx" ON "pdf_templates"("status");

-- CreateIndex
CREATE INDEX "pdf_templates_tenantId_idx" ON "pdf_templates"("tenantId");

-- CreateIndex
CREATE INDEX "pricing_tiers_isActive_idx" ON "pricing_tiers"("isActive");

-- CreateIndex
CREATE INDEX "product_masters_categoryId_idx" ON "product_masters"("categoryId");

-- CreateIndex
CREATE INDEX "product_masters_isActive_idx" ON "product_masters"("isActive");

-- CreateIndex
CREATE INDEX "product_masters_subCategoryId_idx" ON "product_masters"("subCategoryId");

-- CreateIndex
CREATE INDEX "product_masters_tenantId_idx" ON "product_masters"("tenantId");

-- CreateIndex
CREATE INDEX "product_masters_tenantId_name_idx" ON "product_masters"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "product_masters_tenantId_code_key" ON "product_masters"("tenantId", "code");

-- CreateIndex
CREATE INDEX "progress_history_ledgerId_idx" ON "progress_history"("ledgerId");

-- CreateIndex
CREATE INDEX "progress_history_phaseId_idx" ON "progress_history"("phaseId");

-- CreateIndex
CREATE INDEX "progress_history_recordedAt_idx" ON "progress_history"("recordedAt");

-- CreateIndex
CREATE INDEX "progress_history_tenantId_idx" ON "progress_history"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "properties_propertyNo_key" ON "properties"("propertyNo");

-- CreateIndex
CREATE INDEX "properties_customerId_idx" ON "properties"("customerId");

-- CreateIndex
CREATE INDEX "properties_deletedAt_idx" ON "properties"("deletedAt");

-- CreateIndex
CREATE INDEX "properties_propertyNo_idx" ON "properties"("propertyNo");

-- CreateIndex
CREATE INDEX "properties_tenantId_idx" ON "properties"("tenantId");

-- CreateIndex
CREATE INDEX "properties_tenantId_status_idx" ON "properties"("tenantId", "status");

-- CreateIndex
CREATE INDEX "rag_conversations_expiresAt_idx" ON "rag_conversations"("expiresAt");

-- CreateIndex
CREATE INDEX "rag_conversations_tenantId_idx" ON "rag_conversations"("tenantId");

-- CreateIndex
CREATE INDEX "rag_conversations_userId_idx" ON "rag_conversations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "rag_settings_tenantId_key" ON "rag_settings"("tenantId");

-- CreateIndex
CREATE INDEX "rag_usage_tenantId_yearMonth_idx" ON "rag_usage"("tenantId", "yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "rag_usage_tenantId_userId_yearMonth_key" ON "rag_usage"("tenantId", "userId", "yearMonth");

-- CreateIndex
CREATE INDEX "resource_reservations_customerId_idx" ON "resource_reservations"("customerId");

-- CreateIndex
CREATE INDEX "resource_reservations_endTime_idx" ON "resource_reservations"("endTime");

-- CreateIndex
CREATE INDEX "resource_reservations_resourceId_idx" ON "resource_reservations"("resourceId");

-- CreateIndex
CREATE INDEX "resource_reservations_startTime_idx" ON "resource_reservations"("startTime");

-- CreateIndex
CREATE INDEX "resource_reservations_status_idx" ON "resource_reservations"("status");

-- CreateIndex
CREATE INDEX "resource_reservations_tenantId_idx" ON "resource_reservations"("tenantId");

-- CreateIndex
CREATE INDEX "resource_reservations_userId_idx" ON "resource_reservations"("userId");

-- CreateIndex
CREATE INDEX "resources_status_idx" ON "resources"("status");

-- CreateIndex
CREATE INDEX "resources_tenantId_idx" ON "resources"("tenantId");

-- CreateIndex
CREATE INDEX "resources_type_idx" ON "resources"("type");

-- CreateIndex
CREATE INDEX "roles_isSystem_idx" ON "roles"("isSystem");

-- CreateIndex
CREATE INDEX "roles_tenantId_idx" ON "roles"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_tenantId_key" ON "roles"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "rounding_settings_tenantId_key" ON "rounding_settings"("tenantId");

-- CreateIndex
CREATE INDEX "rounding_settings_tenantId_idx" ON "rounding_settings"("tenantId");

-- CreateIndex
CREATE INDEX "sales_activities_activityDate_idx" ON "sales_activities"("activityDate");

-- CreateIndex
CREATE INDEX "sales_activities_activityType_idx" ON "sales_activities"("activityType");

-- CreateIndex
CREATE INDEX "sales_activities_deletedAt_idx" ON "sales_activities"("deletedAt");

-- CreateIndex
CREATE INDEX "sales_activities_opportunityId_idx" ON "sales_activities"("opportunityId");

-- CreateIndex
CREATE INDEX "sales_activities_tenantId_idx" ON "sales_activities"("tenantId");

-- CreateIndex
CREATE INDEX "sales_activities_userId_idx" ON "sales_activities"("userId");

-- CreateIndex
CREATE INDEX "sales_category_master_displayOrder_idx" ON "sales_category_master"("displayOrder");

-- CreateIndex
CREATE INDEX "sales_category_master_level_idx" ON "sales_category_master"("level");

-- CreateIndex
CREATE INDEX "sales_category_master_parentId_idx" ON "sales_category_master"("parentId");

-- CreateIndex
CREATE INDEX "sales_category_master_tenantId_idx" ON "sales_category_master"("tenantId");

-- CreateIndex
CREATE INDEX "sales_category_master_tenantId_status_idx" ON "sales_category_master"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sales_category_master_tenantId_code_key" ON "sales_category_master"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "security_settings_tenantId_key" ON "security_settings"("tenantId");

-- CreateIndex
CREATE INDEX "security_settings_tenantId_idx" ON "security_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_sessionToken_idx" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "system_admins_email_key" ON "system_admins"("email");

-- CreateIndex
CREATE INDEX "system_admins_email_idx" ON "system_admins"("email");

-- CreateIndex
CREATE INDEX "system_admins_isActive_idx" ON "system_admins"("isActive");

-- CreateIndex
CREATE INDEX "tag_master_category_idx" ON "tag_master"("category");

-- CreateIndex
CREATE INDEX "tag_master_tenantId_category_idx" ON "tag_master"("tenantId", "category");

-- CreateIndex
CREATE INDEX "tag_master_tenantId_idx" ON "tag_master"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tag_master_tenantId_name_key" ON "tag_master"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "task_automation_settings_tenantId_key" ON "task_automation_settings"("tenantId");

-- CreateIndex
CREATE INDEX "task_automation_settings_tenantId_idx" ON "task_automation_settings"("tenantId");

-- CreateIndex
CREATE INDEX "task_reminder_logs_sentAt_idx" ON "task_reminder_logs"("sentAt");

-- CreateIndex
CREATE INDEX "task_reminder_logs_taskId_idx" ON "task_reminder_logs"("taskId");

-- CreateIndex
CREATE INDEX "task_reminder_logs_userId_idx" ON "task_reminder_logs"("userId");

-- CreateIndex
CREATE INDEX "tasks_automationType_idx" ON "tasks"("automationType");

-- CreateIndex
CREATE INDEX "tasks_customerId_idx" ON "tasks"("customerId");

-- CreateIndex
CREATE INDEX "tasks_googleEventId_idx" ON "tasks"("googleEventId");

-- CreateIndex
CREATE INDEX "tasks_isRecurring_idx" ON "tasks"("isRecurring");

-- CreateIndex
CREATE INDEX "tasks_isTemplate_idx" ON "tasks"("isTemplate");

-- CreateIndex
CREATE INDEX "tasks_opportunityId_idx" ON "tasks"("opportunityId");

-- CreateIndex
CREATE INDEX "tasks_parentTaskId_idx" ON "tasks"("parentTaskId");

-- CreateIndex
CREATE INDEX "tasks_priority_idx" ON "tasks"("priority");

-- CreateIndex
CREATE INDEX "tasks_relatedEntityId_idx" ON "tasks"("relatedEntityId");

-- CreateIndex
CREATE INDEX "tasks_relatedEntityType_idx" ON "tasks"("relatedEntityType");

-- CreateIndex
CREATE INDEX "tasks_reminderSent_idx" ON "tasks"("reminderSent");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_tenantId_dueDate_idx" ON "tasks"("tenantId", "dueDate");

-- CreateIndex
CREATE INDEX "tasks_tenantId_idx" ON "tasks"("tenantId");

-- CreateIndex
CREATE INDEX "tasks_tenantId_parentTaskId_status_idx" ON "tasks"("tenantId", "parentTaskId", "status");

-- CreateIndex
CREATE INDEX "tasks_tenantId_userId_idx" ON "tasks"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "tasks_type_idx" ON "tasks"("type");

-- CreateIndex
CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");

-- CreateIndex
CREATE INDEX "tax_category_master_isActive_idx" ON "tax_category_master"("isActive");

-- CreateIndex
CREATE INDEX "tax_category_master_taxType_idx" ON "tax_category_master"("taxType");

-- CreateIndex
CREATE INDEX "tax_category_master_tenantId_idx" ON "tax_category_master"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_category_master_tenantId_code_key" ON "tax_category_master"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_fiscal_settings_tenantId_key" ON "tenant_fiscal_settings"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_fiscal_settings_tenantId_idx" ON "tenant_fiscal_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_invoices_invoiceNumber_key" ON "tenant_invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "tenant_invoices_billingPeriod_idx" ON "tenant_invoices"("billingPeriod");

-- CreateIndex
CREATE INDEX "tenant_invoices_dueDate_idx" ON "tenant_invoices"("dueDate");

-- CreateIndex
CREATE INDEX "tenant_invoices_status_idx" ON "tenant_invoices"("status");

-- CreateIndex
CREATE INDEX "tenant_invoices_tenantId_idx" ON "tenant_invoices"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_settings_tenantId_key" ON "tenant_settings"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_settings_tenantId_idx" ON "tenant_settings"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_usage_history_date_idx" ON "tenant_usage_history"("date");

-- CreateIndex
CREATE INDEX "tenant_usage_history_tenantId_idx" ON "tenant_usage_history"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_usage_history_tenantId_date_key" ON "tenant_usage_history"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_customerCode_key" ON "tenants"("customerCode");

-- CreateIndex
CREATE INDEX "tenants_isActive_idx" ON "tenants"("isActive");

-- CreateIndex
CREATE INDEX "tenants_isSuperAdmin_idx" ON "tenants"("isSuperAdmin");

-- CreateIndex
CREATE INDEX "tenants_plan_idx" ON "tenants"("plan");

-- CreateIndex
CREATE INDEX "trade_cost_agreements_status_idx" ON "trade_cost_agreements"("status");

-- CreateIndex
CREATE INDEX "trade_cost_agreements_tenantId_idx" ON "trade_cost_agreements"("tenantId");

-- CreateIndex
CREATE INDEX "trade_cost_agreements_tradeCode_idx" ON "trade_cost_agreements"("tradeCode");

-- CreateIndex
CREATE UNIQUE INDEX "trade_cost_agreements_tenantId_tradeCode_key" ON "trade_cost_agreements"("tenantId", "tradeCode");

-- CreateIndex
CREATE INDEX "trade_cost_price_ranges_agreementId_idx" ON "trade_cost_price_ranges"("agreementId");

-- CreateIndex
CREATE INDEX "user_notification_settings_tenantId_idx" ON "user_notification_settings"("tenantId");

-- CreateIndex
CREATE INDEX "user_notification_settings_userId_idx" ON "user_notification_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_settings_tenantId_userId_key" ON "user_notification_settings"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_invitationToken_key" ON "users"("invitationToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetPasswordToken_key" ON "users"("resetPasswordToken");

-- CreateIndex
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_isAvailable_idx" ON "users"("isAvailable");

-- CreateIndex
CREATE INDEX "users_isSuperAdmin_idx" ON "users"("isSuperAdmin");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "work_item_masters_categoryId_idx" ON "work_item_masters"("categoryId");

-- CreateIndex
CREATE INDEX "work_item_masters_isActive_idx" ON "work_item_masters"("isActive");

-- CreateIndex
CREATE INDEX "work_item_masters_subCategoryId_idx" ON "work_item_masters"("subCategoryId");

-- CreateIndex
CREATE INDEX "work_item_masters_tenantId_idx" ON "work_item_masters"("tenantId");

-- CreateIndex
CREATE INDEX "work_item_masters_tenantId_name_idx" ON "work_item_masters"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "work_item_masters_tenantId_code_key" ON "work_item_masters"("tenantId", "code");

-- CreateIndex
CREATE INDEX "work_log_categories_tenantId_idx" ON "work_log_categories"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "work_log_categories_tenantId_code_key" ON "work_log_categories"("tenantId", "code");

-- CreateIndex
CREATE INDEX "work_logs_calendarEventId_idx" ON "work_logs"("calendarEventId");

-- CreateIndex
CREATE INDEX "work_logs_ledgerId_idx" ON "work_logs"("ledgerId");

-- CreateIndex
CREATE INDEX "work_logs_tenantId_idx" ON "work_logs"("tenantId");

-- CreateIndex
CREATE INDEX "work_logs_userId_idx" ON "work_logs"("userId");

-- CreateIndex
CREATE INDEX "work_logs_workDate_idx" ON "work_logs"("workDate");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_settings_tenantId_key" ON "workflow_settings"("tenantId");

-- CreateIndex
CREATE INDEX "workflow_settings_tenantId_idx" ON "workflow_settings"("tenantId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attachments" ADD CONSTRAINT "activity_attachments_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "sales_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_actions" ADD CONSTRAINT "approval_actions_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "approval_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_condition" ADD CONSTRAINT "approval_condition_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "approval_flow_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_instance_steps" ADD CONSTRAINT "approval_instance_steps_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "approval_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_instances" ADD CONSTRAINT "approval_instances_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "approval_flow_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_step" ADD CONSTRAINT "approval_step_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "approval_flow_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_history" ADD CONSTRAINT "backup_history_backupSettingsId_fkey" FOREIGN KEY ("backupSettingsId") REFERENCES "backup_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_attachments" ADD CONSTRAINT "case_attachments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_events" ADD CONSTRAINT "case_events_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_relations" ADD CONSTRAINT "case_relations_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_watchers" ADD CONSTRAINT "case_watchers_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_phases" ADD CONSTRAINT "construction_phases_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "construction_ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_sub_categories" ADD CONSTRAINT "construction_sub_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "construction_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_changes" ADD CONSTRAINT "contract_changes_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "construction_ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_inspections" ADD CONSTRAINT "contract_inspections_planId_fkey" FOREIGN KEY ("planId") REFERENCES "inspection_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_inspections" ADD CONSTRAINT "contract_inspections_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "inspection_plan_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_inspectionPlanId_fkey" FOREIGN KEY ("inspectionPlanId") REFERENCES "inspection_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "construction_ledgers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_subject_master" ADD CONSTRAINT "cost_subject_master_accountSubjectId_fkey" FOREIGN KEY ("accountSubjectId") REFERENCES "account_subject_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_building_info" ADD CONSTRAINT "customer_building_info_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_equipment" ADD CONSTRAINT "customer_equipment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_family_members" ADD CONSTRAINT "customer_family_members_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_family_members" ADD CONSTRAINT "customer_family_members_linkedCustomerId_fkey" FOREIGN KEY ("linkedCustomerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_referrals" ADD CONSTRAINT "customer_referrals_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_referrals" ADD CONSTRAINT "customer_referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_budgets" ADD CONSTRAINT "expense_budgets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_attachments" ADD CONSTRAINT "feedback_attachments_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_comments" ADD CONSTRAINT "feedback_comments_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_upvotes" ADD CONSTRAINT "feedback_upvotes_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_plan_category_items" ADD CONSTRAINT "financial_plan_category_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "financial_plan_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "full_reno_room" ADD CONSTRAINT "full_reno_room_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "full_reno_estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "full_reno_room_opening" ADD CONSTRAINT "full_reno_room_opening_openingMasterId_fkey" FOREIGN KEY ("openingMasterId") REFERENCES "opening_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "full_reno_room_opening" ADD CONSTRAINT "full_reno_room_opening_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "full_reno_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "full_reno_work_item" ADD CONSTRAINT "full_reno_work_item_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "full_reno_estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "full_reno_work_item" ADD CONSTRAINT "full_reno_work_item_workItemMasterId_fkey" FOREIGN KEY ("workItemMasterId") REFERENCES "full_reno_work_item_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_calendar_integrations" ADD CONSTRAINT "google_calendar_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_plan_steps" ADD CONSTRAINT "inspection_plan_steps_planId_fkey" FOREIGN KEY ("planId") REFERENCES "inspection_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_expenses" ADD CONSTRAINT "ledger_expenses_accountSubjectId_fkey" FOREIGN KEY ("accountSubjectId") REFERENCES "account_subject_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_expenses" ADD CONSTRAINT "ledger_expenses_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "construction_ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_conversions" ADD CONSTRAINT "ma_conversions_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ma_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_email_tracking" ADD CONSTRAINT "ma_email_tracking_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "ma_emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_journey_executions" ADD CONSTRAINT "ma_journey_executions_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "ma_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_journey_executions" ADD CONSTRAINT "ma_journey_executions_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ma_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_lead_duplicates" ADD CONSTRAINT "ma_lead_duplicates_sourceLeadId_fkey" FOREIGN KEY ("sourceLeadId") REFERENCES "ma_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_lead_duplicates" ADD CONSTRAINT "ma_lead_duplicates_targetLeadId_fkey" FOREIGN KEY ("targetLeadId") REFERENCES "ma_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_leads" ADD CONSTRAINT "ma_leads_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_leads" ADD CONSTRAINT "ma_leads_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_cash_balances" ADD CONSTRAINT "monthly_cash_balances_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_expense_forecasts" ADD CONSTRAINT "monthly_expense_forecasts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_expenses" ADD CONSTRAINT "monthly_expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_accountSubjectId_fkey" FOREIGN KEY ("accountSubjectId") REFERENCES "account_subject_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "construction_ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partner_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordinary_profit_targets" ADD CONSTRAINT "ordinary_profit_targets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_masters" ADD CONSTRAINT "product_masters_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "construction_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_masters" ADD CONSTRAINT "product_masters_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "construction_sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_history" ADD CONSTRAINT "progress_history_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "construction_ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rag_conversations" ADD CONSTRAINT "rag_conversations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rag_conversations" ADD CONSTRAINT "rag_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rag_settings" ADD CONSTRAINT "rag_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rag_usage" ADD CONSTRAINT "rag_usage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rag_usage" ADD CONSTRAINT "rag_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_reservations" ADD CONSTRAINT "resource_reservations_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_category_master" ADD CONSTRAINT "sales_category_master_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "sales_category_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_fiscal_settings" ADD CONSTRAINT "tenant_fiscal_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_invoices" ADD CONSTRAINT "tenant_invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_usage_history" ADD CONSTRAINT "tenant_usage_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_cost_price_ranges" ADD CONSTRAINT "trade_cost_price_ranges_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "trade_cost_agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_item_masters" ADD CONSTRAINT "work_item_masters_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "construction_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_item_masters" ADD CONSTRAINT "work_item_masters_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "construction_sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
┌─────────────────────────────────────────────────────────┐
│  Update available 6.19.0 -> 7.3.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

