import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  campaign_sends: defineTable({
    id: v.string(),
    campaign_id: v.string(),
    contact_id: v.string(),
    email_address: v.string(),
    status: v.string(),
    created_at: v.string(),
    sent_at: v.optional(v.string()),
    delivered_at: v.optional(v.string()),
    opened_at: v.optional(v.string()),
    clicked_at: v.optional(v.string()),
    error_message: v.optional(v.string()),
  }).index("by_campaign", ["campaign_id"]),

  checklist_templates: defineTable({
    id: v.string(),
    name: v.string(),
    items: v.any(),
    created_at: v.string(),
    updated_at: v.string(),
  }),

  client_checklists: defineTable({
    id: v.string(),
    client_id: v.string(),
    template_id: v.string(),
    template_name: v.string(),
    user_id: v.string(),
    status: v.string(),
    completed_at: v.optional(v.string()),
    completed_items: v.optional(v.any()),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_client", ["client_id"])
    .index("by_template", ["template_id"])
    .index("by_user", ["user_id"]),

  clients: defineTable({
    id: v.string(),
    user_id: v.string(),
    company: v.string(),
    status: v.string(),
    joined_date: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
    description: v.optional(v.string()),
    avatar: v.optional(v.string()),
    gradient: v.optional(v.string()),
    phone: v.optional(v.string()),
    projects_count: v.optional(v.number()),
    total_value: v.optional(v.number()),
    xero_contact_id: v.optional(v.string()),
  })
    .index("by_user", ["user_id"])
    .index("by_public_id", ["id"]),

  company_settings: defineTable({
    id: v.string(),
    user_id: v.string(),
    company_name: v.optional(v.string()),
    address_line1: v.optional(v.string()),
    address_line2: v.optional(v.string()),
    address_line3: v.optional(v.string()),
    bank_account: v.optional(v.string()),
    bank_details: v.optional(v.string()),
    gst_number: v.optional(v.string()),
    owner_name: v.optional(v.string()),
    logo_base64: v.optional(v.string()),
    logo_inverse_base64: v.optional(v.string()),
    xero_account_code: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_user", ["user_id"]),

  contacts: defineTable({
    id: v.string(),
    client_id: v.string(),
    name: v.string(),
    email: v.string(),
    is_primary: v.boolean(),
    email_subscribed: v.boolean(),
    role: v.optional(v.string()),
    phone: v.optional(v.string()),
    unsubscribed_at: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_client", ["client_id"])
    .index("by_email", ["email"]),

  domains: defineTable({
    id: v.string(),
    client_id: v.string(),
    name: v.string(),
    registrar: v.string(),
    platform: v.string(),
    renewal_cost: v.number(),
    renewal_date: v.string(),
    client_managed: v.boolean(),
    notes: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_client", ["client_id"]),

  email_campaigns: defineTable({
    id: v.string(),
    user_id: v.string(),
    name: v.string(),
    subject: v.string(),
    status: v.string(),
    content_html: v.string(),
    content_json: v.optional(v.any()),
    recipient_count: v.optional(v.number()),
    opened_count: v.optional(v.number()),
    clicked_count: v.optional(v.number()),
    delivered_count: v.optional(v.number()),
    scheduled_at: v.optional(v.string()),
    sent_at: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_user", ["user_id"]),

  email_images: defineTable({
    id: v.string(),
    user_id: v.string(),
    file_name: v.string(),
    file_path: v.string(),
    mime_type: v.optional(v.string()),
    file_size: v.optional(v.number()),
    alt_text: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_user", ["user_id"]),

  email_logs: defineTable({
    id: v.string(),
    invoice_id: v.string(),
    recipient_email: v.string(),
    subject: v.string(),
    status: v.string(),
    sent_at: v.string(),
    error_message: v.optional(v.string()),
    created_at: v.string(),
  })
    .index("by_invoice", ["invoice_id"])
    .index("by_public_id", ["id"]),

  email_templates: defineTable({
    id: v.string(),
    user_id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    content_html: v.string(),
    content_json: v.optional(v.any()),
    is_default: v.optional(v.boolean()),
    thumbnail_url: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_user", ["user_id"]),

  hosting: defineTable({
    id: v.string(),
    client_id: v.string(),
    provider: v.string(),
    platform: v.string(),
    plan: v.string(),
    renewal_cost: v.optional(v.number()),
    renewal_date: v.optional(v.string()),
    login_url: v.optional(v.string()),
    notes: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_client", ["client_id"]),

  ideas: defineTable({
    id: v.string(),
    user_id: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    priority: v.string(),
    status: v.string(),
    tags: v.optional(v.array(v.string())),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_user", ["user_id"]),

  invoice_items: defineTable({
    id: v.string(),
    invoice_id: v.string(),
    description: v.string(),
    quantity: v.number(),
    rate: v.number(),
    amount: v.number(),
    created_at: v.string(),
  })
    .index("by_invoice", ["invoice_id"])
    .index("by_public_id", ["id"]),

  invoice_payments: defineTable({
    id: v.string(),
    invoice_id: v.string(),
    amount: v.number(),
    payment_method: v.optional(v.string()),
    payment_date: v.optional(v.string()),
    notes: v.optional(v.string()),
    created_at: v.string(),
  })
    .index("by_invoice", ["invoice_id"])
    .index("by_public_id", ["id"]),

  invoices: defineTable({
    id: v.string(),
    user_id: v.string(),
    client_id: v.string(),
    project_id: v.optional(v.string()),
    invoice_number: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    subtotal: v.number(),
    subtotal_incl_gst: v.optional(v.number()),
    gst_amount: v.optional(v.number()),
    gst_rate: v.optional(v.number()),
    total_amount: v.number(),
    balance_due: v.optional(v.number()),
    deposit_amount: v.optional(v.number()),
    deposit_percentage: v.optional(v.number()),
    issued_date: v.optional(v.string()),
    due_date: v.optional(v.string()),
    paid_date: v.optional(v.string()),
    last_emailed_at: v.optional(v.string()),
    xero_invoice_id: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_user", ["user_id"])
    .index("by_client", ["client_id"])
    .index("by_project", ["project_id"])
    .index("by_status", ["status"])
    .index("by_public_id", ["id"]),

  profiles: defineTable({
    id: v.string(),
    email: v.optional(v.string()),
    full_name: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
    current_task: v.optional(v.string()),
    hours_this_week: v.optional(v.number()),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_email", ["email"]),

  project_team_members: defineTable({
    id: v.string(),
    project_id: v.string(),
    user_id: v.string(),
    assigned_at: v.string(),
  })
    .index("by_project", ["project_id"])
    .index("by_user", ["user_id"]),

  projects: defineTable({
    id: v.string(),
    client_id: v.string(),
    user_id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    start_date: v.optional(v.string()),
    due_date: v.optional(v.string()),
    budget: v.optional(v.number()),
    progress: v.optional(v.number()),
    is_retainer: v.boolean(),
    is_billable: v.boolean(),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_user", ["user_id"])
    .index("by_client", ["client_id"])
    .index("by_status", ["status"])
    .index("by_public_id", ["id"]),

  quote_blocks: defineTable({
    id: v.string(),
    quote_id: v.string(),
    block_type: v.string(),
    content: v.optional(v.string()),
    title: v.optional(v.string()),
    image_url: v.optional(v.string()),
    order_index: v.number(),
    created_at: v.string(),
  }).index("by_quote", ["quote_id"]),

  quote_events: defineTable({
    id: v.string(),
    quote_id: v.string(),
    event_type: v.string(),
    ip_address: v.optional(v.string()),
    user_agent: v.optional(v.string()),
    created_at: v.string(),
  }).index("by_quote", ["quote_id"]),

  quote_items: defineTable({
    id: v.string(),
    quote_id: v.string(),
    description: v.string(),
    quantity: v.number(),
    rate: v.number(),
    amount: v.number(),
    is_optional: v.boolean(),
    order_index: v.number(),
    created_at: v.string(),
  }).index("by_quote", ["quote_id"]),

  quote_templates: defineTable({
    id: v.string(),
    user_id: v.string(),
    name: v.string(),
    block_type: v.string(),
    content: v.optional(v.string()),
    is_default: v.optional(v.boolean()),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_user", ["user_id"]),

  quotes: defineTable({
    id: v.string(),
    user_id: v.string(),
    client_id: v.string(),
    public_token: v.string(),
    quote_number: v.string(),
    title: v.string(),
    status: v.string(),
    project_type: v.optional(v.string()),
    creator_name: v.optional(v.string()),
    contact_name: v.optional(v.string()),
    contact_email: v.optional(v.string()),
    cover_image_url: v.optional(v.string()),
    deposit_percentage: v.number(),
    total_amount: v.number(),
    accepted_at: v.optional(v.string()),
    accepted_by_name: v.optional(v.string()),
    valid_until: v.optional(v.string()),
    viewed_at: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_user", ["user_id"])
    .index("by_client", ["client_id"])
    .index("by_token", ["public_token"])
    .index("by_status", ["status"]),

  task_files: defineTable({
    id: v.string(),
    task_id: v.string(),
    user_id: v.string(),
    file_name: v.string(),
    file_path: v.string(),
    mime_type: v.optional(v.string()),
    file_size: v.optional(v.number()),
    created_at: v.string(),
  }).index("by_task", ["task_id"]),

  task_planning: defineTable({
    id: v.string(),
    task_id: v.string(),
    user_id: v.string(),
    allocated_minutes: v.number(),
    is_scheduled: v.boolean(),
    order_index: v.number(),
    scheduled_date: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_task", ["task_id"])
    .index("by_user", ["user_id"]),

  tasks: defineTable({
    id: v.string(),
    user_id: v.string(),
    client_id: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    assignee: v.optional(v.string()),
    billable_amount: v.optional(v.number()),
    billing_description: v.optional(v.string()),
    progress: v.optional(v.number()),
    dropbox_url: v.optional(v.string()),
    notes: v.optional(v.string()),
    due_date: v.optional(v.string()),
    project: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_user", ["user_id"])
    .index("by_client", ["client_id"])
    .index("by_status", ["status"])
    .index("by_public_id", ["id"]),

  time_entries: defineTable({
    id: v.string(),
    task_id: v.string(),
    user_id: v.string(),
    date: v.string(),
    description: v.string(),
    hours: v.number(),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_task", ["task_id"])
    .index("by_user", ["user_id"])
    .index("by_public_id", ["id"]),

  time_slots: defineTable({
    id: v.string(),
    user_id: v.string(),
    date: v.string(),
    time_slot: v.string(),
    title: v.optional(v.string()),
    task_id: v.optional(v.string()),
    task_type: v.optional(v.string()),
    color: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_user_date", ["user_id", "date"]),

  xero_oauth_states: defineTable({
    id: v.string(),
    user_id: v.string(),
    state: v.string(),
    frontend_origin: v.optional(v.string()),
    created_at: v.string(),
  }).index("by_state", ["state"]),

  xero_tokens: defineTable({
    id: v.string(),
    user_id: v.string(),
    access_token: v.string(),
    refresh_token: v.string(),
    tenant_id: v.string(),
    tenant_name: v.optional(v.string()),
    expires_at: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_user", ["user_id"]),
});
