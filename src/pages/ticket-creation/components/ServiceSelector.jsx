import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ServiceSelector = ({ category, categoryLabel, selectedService, onServiceSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const servicesByCategory = {
  "cybersecurity-requests": [
    { "id": "cs-password-manager", "nameEn": "Password Manager Requests", "nameAr": "Ø·Ù„Ø¨Ø§Øª Ù…Ø¯ÙŠØ± ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ø±ÙˆØ±" },
    { "id": "cs-pass-through-email", "nameEn": "Pass through email", "nameAr": "ØªÙ…Ø±ÙŠØ± Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ" },
    { "id": "cs-remote-access", "nameEn": "Remote Access", "nameAr": "Ø§Ù„ÙˆØµÙˆÙ„ Ø¹Ù† Ø¨Ø¹Ø¯" },
    { "id": "cs-firewall-services", "nameEn": "Firewall services", "nameAr": "Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø¬Ø¯Ø§Ø± Ø§Ù„Ù†Ø§Ø±ÙŠ" },
    { "id": "cs-website-availability", "nameEn": "Website availability service", "nameAr": "Ø®Ø¯Ù…Ø© ØªÙˆÙØ± Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ" },
    { "id": "cs-usb-port", "nameEn": "USB port service", "nameAr": "Ø®Ø¯Ù…Ø© Ù…Ù†ÙØ° USB" },
    { "id": "cs-other-security", "nameEn": "Other Cyber Security Service Request", "nameAr": "Ø·Ù„Ø¨ Ø®Ø¯Ù…Ø© Ø£Ø®Ø±Ù‰ Ù„Ù„Ø£Ù…Ù† Ø§Ù„Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ" }
  ],
  "noc-requests": [
    { "id": "noc-service", "nameEn": "Request NOC Service", "nameAr": "Ø·Ù„Ø¨ Ø®Ø¯Ù…Ø© Ù…Ø±ÙƒØ² Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø´Ø¨ÙƒØ©" },
    { "id": "noc-ports", "nameEn": "Open or Close Network Communication Ports", "nameAr": "ÙØªØ­ Ø£Ùˆ Ø¥ØºÙ„Ø§Ù‚ Ù…Ù†Ø§ÙØ° Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ø´Ø¨ÙƒÙŠ" }
  ],
  "infrastructure-service-requests": [
    { "id": "infra-active-directory", "nameEn": "Active Directory Services", "nameAr": "Ø®Ø¯Ù…Ø§Øª Active Directory" },
    { "id": "infra-backup", "nameEn": "Backup Services", "nameAr": "Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù†Ø³Ø® Ø§Ù„Ø§Ø­ØªÙŠØ§Ø·ÙŠ" },
    { "id": "infra-dns", "nameEn": "DNS", "nameAr": "DNS" },
    { "id": "infra-domain-controller", "nameEn": "Domain Controller", "nameAr": "Ù…ØªØ­ÙƒÙ… Ø§Ù„Ù†Ø·Ø§Ù‚" },
    { "id": "infra-email", "nameEn": "Email Services", "nameAr": "Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ" },
    { "id": "infra-permission", "nameEn": "Permission Services", "nameAr": "Ø®Ø¯Ù…Ø§Øª Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª" },
    { "id": "infra-server", "nameEn": "Server Services", "nameAr": "Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø®ÙˆØ§Ø¯Ù…" },
    { "id": "infra-pam", "nameEn": "PAM", "nameAr": "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙˆØµÙˆÙ„ Ø§Ù„Ù…Ù…ÙŠØ²" },
    { "id": "infra-other", "nameEn": "Other Request", "nameAr": "Ø·Ù„Ø¨ Ø¢Ø®Ø±" }
  ],
  "network-requests": [
    { "id": "net-firewall", "nameEn": "Firewall services", "nameAr": "Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø¬Ø¯Ø§Ø± Ø§Ù„Ù†Ø§Ø±ÙŠ" },
    { "id": "net-load-balancing", "nameEn": "Load balancing services", "nameAr": "Ø®Ø¯Ù…Ø§Øª Ù…ÙˆØ§Ø²Ù†Ø© Ø§Ù„Ø£Ø­Ù…Ø§Ù„" },
    { "id": "net-services", "nameEn": "Network services", "nameAr": "Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø´Ø¨ÙƒØ©" },
    { "id": "net-remote-access", "nameEn": "Remote Access", "nameAr": "Ø§Ù„ÙˆØµÙˆÙ„ Ø¹Ù† Ø¨Ø¹Ø¯" },
    { "id": "net-other", "nameEn": "Other Network Service Requests", "nameAr": "Ø·Ù„Ø¨Ø§Øª Ø´Ø¨ÙƒØ© Ø£Ø®Ø±Ù‰" }
  ],
  "development-application-requests": [
    { "id": "dev-data-migration", "nameEn": "Data Migration", "nameAr": "ØªØ±Ø­ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª" },
    { "id": "dev-major-enhancement", "nameEn": "Major Service Enhancement", "nameAr": "ØªØ­Ø³ÙŠÙ† Ø±Ø¦ÙŠØ³ÙŠ Ù„Ù„Ø®Ø¯Ù…Ø©" },
    { "id": "dev-minor-modification", "nameEn": "Minor modification", "nameAr": "ØªØ¹Ø¯ÙŠÙ„ Ø¨Ø³ÙŠØ·" },
    { "id": "dev-minor-enhancement", "nameEn": "Minor Service Enhancement", "nameAr": "ØªØ­Ø³ÙŠÙ† Ø¨Ø³ÙŠØ· Ù„Ù„Ø®Ø¯Ù…Ø©" },
    { "id": "dev-modify-ip", "nameEn": "Modify IP", "nameAr": "ØªØ¹Ø¯ÙŠÙ„ Ø¹Ù†ÙˆØ§Ù† IP" },
    { "id": "dev-network-failure", "nameEn": "Network Failure", "nameAr": "ÙØ´Ù„ Ø§Ù„Ø´Ø¨ÙƒØ©" },
    { "id": "dev-new-feature", "nameEn": "New Feature Request", "nameAr": "Ø·Ù„Ø¨ Ù…ÙŠØ²Ø© Ø¬Ø¯ÙŠØ¯Ø©" },
    { "id": "dev-new-tool", "nameEn": "New Tool Request", "nameAr": "Ø·Ù„Ø¨ Ø£Ø¯Ø§Ø© Ø¬Ø¯ÙŠØ¯Ø©" },
    { "id": "dev-password-reset", "nameEn": "Password Reset", "nameAr": "Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±" },
    { "id": "dev-performance-improvement", "nameEn": "Performance Improvement", "nameAr": "ØªØ­Ø³ÙŠÙ† Ø§Ù„Ø£Ø¯Ø§Ø¡" },
    { "id": "dev-other", "nameEn": "Other Development & Application service Request", "nameAr": "Ø·Ù„Ø¨ Ø®Ø¯Ù…Ø© Ø£Ø®Ø±Ù‰ Ù„Ù„ØªØ·ÙˆÙŠØ± ÙˆØ§Ù„ØªØ·Ø¨ÙŠÙ‚Ø§Øª" },
    { "id": "dev-request-domain", "nameEn": "Request New Domain", "nameAr": "Ø·Ù„Ø¨ Ù†Ø·Ø§Ù‚ Ø¬Ø¯ÙŠØ¯" },
    { "id": "dev-server-outage", "nameEn": "Server Outage", "nameAr": "Ø§Ù†Ù‚Ø·Ø§Ø¹ Ø§Ù„Ø®Ø§Ø¯Ù…" },
    { "id": "dev-service-testing", "nameEn": "Service Testing", "nameAr": "Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø®Ø¯Ù…Ø©" },
    { "id": "dev-system-down", "nameEn": "System Down", "nameAr": "ØªØ¹Ø·Ù„ Ø§Ù„Ù†Ø¸Ø§Ù…" },
    { "id": "dev-system-testing", "nameEn": "System Testing", "nameAr": "Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ù†Ø¸Ø§Ù…" },
    { "id": "dev-system-upgrade", "nameEn": "System Upgrade", "nameAr": "ØªØ±Ù‚ÙŠØ© Ø§Ù„Ù†Ø¸Ø§Ù…" }
  ],
  "qa-qc-requests": [
    { "id": "qa-cloud-testing", "nameEn": "Cloud Testing", "nameAr": "Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø³Ø­Ø§Ø¨Ø©" },
    { "id": "qa-code-review", "nameEn": "Code Review", "nameAr": "Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„ÙƒÙˆØ¯" },
    { "id": "qa-database-testing", "nameEn": "Database Testing", "nameAr": "Ø§Ø®ØªØ¨Ø§Ø± Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª" },
    { "id": "qa-faction-testing", "nameEn": "Faction Testing", "nameAr": "Ø§Ø®ØªØ¨Ø§Ø± Faction" },
    { "id": "qa-other", "nameEn": "Other QA/QC Requests", "nameAr": "Ø·Ù„Ø¨Ø§Øª QA/QC Ø£Ø®Ø±Ù‰" },
    { "id": "qa-quality-control", "nameEn": "Quality Control", "nameAr": "Ø¶Ø¨Ø· Ø§Ù„Ø¬ÙˆØ¯Ø©" },
    { "id": "qa-security-control", "nameEn": "Security Control", "nameAr": "Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„Ø£Ù…Ù†ÙŠ" },
    { "id": "qa-services-testing", "nameEn": "Services Testing", "nameAr": "Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø®Ø¯Ù…Ø§Øª" }
  ],
  "digital-transformation-requests": [
    { "id": "dt-services", "nameEn": "Request Digital Transformation Services", "nameAr": "Ø·Ù„Ø¨ Ø®Ø¯Ù…Ø§Øª Ø§Ù„ØªØ­ÙˆÙ„ Ø§Ù„Ø±Ù‚Ù…ÙŠ" }
  ],
  "technical-support-requests": [
    { "id": "ts-create-account", "nameEn": "Create User Account", "nameAr": "Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ù…Ø³ØªØ®Ø¯Ù…" },
    { "id": "ts-device-fix", "nameEn": "Fix User Device Issues", "nameAr": "Ø§ØµÙ„Ø§Ø­ Ù…Ø´Ø§ÙƒÙ„ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†" },
    { "id": "ts-office-install", "nameEn": "Install Office Software", "nameAr": "ØªØ«Ø¨ÙŠØª Ø§Ù„Ø¨Ø±Ù…Ø¬ÙŠØ§Øª Ø§Ù„Ù…ÙƒØªØ¨ÙŠØ©" },
    { "id": "ts-user-system-update", "nameEn": "Update User-Related Systems", "nameAr": "ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø£Ù†Ø¸Ù…Ø© Ø§Ù„Ù…ØªØ¹Ù„Ù‚Ù‡ Ø¨Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†" },
    { "id": "ts-edit-user", "nameEn": "Modify User Details", "nameAr": "ØªØ¹Ø¯ÙŠÙ„ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…" },
    { "id": "ts-password-reset", "nameEn": "Password Reset Request", "nameAr": "Ø·Ù„Ø¨ Ø§Ø³ØªØ¹Ø§Ø¯Ø© ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ±" },
    { "id": "ts-specialized-software", "nameEn": "Install Specialized Software", "nameAr": "Ø·Ù„Ø¨ ØªØ«Ø¨ÙŠØª Ø¨Ø±Ø§Ù…Ø¬ Ø¥Ø¶Ø§ÙÙŠØ© Ù…ØªØ®ØµØµØ©" },
    { "id": "ts-ms-office", "nameEn": "Install MS Office", "nameAr": "Ø·Ù„Ø¨ ØªØ«Ø¨ÙŠØª Ø¨Ø±Ø§Ù…Ø¬ Ù…ÙƒØªØ¨ÙŠØ© Ø£Ø³Ø§Ø³ÙŠØ© MS Office" },
    { "id": "ts-recording", "nameEn": "Voice Recording Request", "nameAr": "Ø·Ù„Ø¨ ØªØ³Ø¬ÙŠÙ„ ØµÙˆØªÙŠ" },
    { "id": "ts-new-device", "nameEn": "Request New Device", "nameAr": "Ø·Ù„Ø¨ Ø¬Ù‡Ø§Ø² Ø¬Ø¯ÙŠØ¯" },
    { "id": "ts-monitor", "nameEn": "Request Monitor", "nameAr": "Ø·Ù„Ø¨ Ø´Ø§Ø´Ø© Ø¹Ø±Ø¶" },
    { "id": "ts-keyboard-mouse", "nameEn": "Keyboard / Mouse / Accessories", "nameAr": "Ø·Ù„Ø¨ Ù„ÙˆØ­Ø© Ù…ÙØ§ØªÙŠØ­ Ø£Ùˆ ÙØ£Ø±Ø© Ø£Ùˆ Ø§ÙƒØ³Ø³ÙˆØ§Ø±Ø§Øª" },
    { "id": "ts-other-support", "nameEn": "Other Technical Support Request", "nameAr": "Ø®Ø¯Ù…Ø§Øª Ø§Ø®Ø±Ù‰" }
  ],
  "technical-support": [
    { "id": "ts-device-not-working", "nameEn": "Device Not Working", "nameAr": "Ø§Ù„Ø¬Ù‡Ø§Ø² Ù„Ø§ ÙŠØ¹Ù…Ù„" },
    { "id": "ts-slow-performance", "nameEn": "Slow Performance", "nameAr": "Ø¨Ø·Ø¡ ÙÙŠ Ø§Ù„Ø£Ø¯Ø§Ø¡" },
    { "id": "ts-blue-screen", "nameEn": "Blue Screen / System Crash", "nameAr": "Ø§Ù„Ø´Ø§Ø´Ø© Ø§Ù„Ø²Ø±Ù‚Ø§Ø¡ / ØªØ¹Ø·Ù„ Ø§Ù„Ù†Ø¸Ø§Ù…" },
    { "id": "ts-monitor-issue", "nameEn": "Monitor Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„Ø´Ø§Ø´Ø©" },
    { "id": "ts-printer-issue", "nameEn": "Printer Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„Ø·Ø§Ø¨Ø¹Ø©" },
    { "id": "ts-keyboard-mouse", "nameEn": "Keyboard / Mouse Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ù„ÙˆØ­Ø© Ø§Ù„Ù…ÙØ§ØªÙŠØ­ Ø£Ùˆ Ø§Ù„ÙØ£Ø±Ø©" },
    { "id": "ts-network-connection", "nameEn": "Network Connection Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø´Ø¨ÙƒØ©" },
    { "id": "ts-internet-access", "nameEn": "Internet Access Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ø¥Ù†ØªØ±Ù†Øª" },
    { "id": "ts-email-issue", "nameEn": "Email Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ" },
    { "id": "ts-transfer-device", "nameEn": "Transfer Device", "nameAr": "Ù†Ù‚Ù„ Ø¬Ù‡Ø§Ø²" },
    { "id": "ts-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "project-management": [
    { "id": "pm-request", "nameEn": "Project management", "nameAr": "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹" }
  ],
  "access-management": [
    { "id": "am-new-account", "nameEn": "Create New User Account", "nameAr": "Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ù…Ø³ØªØ®Ø¯Ù… Ø¬Ø¯ÙŠØ¯" },
    { "id": "am-disable-account", "nameEn": "Disable / Terminate User Account", "nameAr": "ØªØ¹Ø·ÙŠÙ„ Ø£Ùˆ Ø¥Ù†Ù‡Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ù…Ø³ØªØ®Ø¯Ù…" },
    { "id": "am-reset-password", "nameEn": "Password Reset", "nameAr": "Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±" },
    { "id": "am-unlock-account", "nameEn": "Unlock Account", "nameAr": "ÙØªØ­ Ø­Ø³Ø§Ø¨ Ù…Ù‚ÙÙ„" },
    { "id": "am-grant-permission", "nameEn": "Grant / Modify Permissions", "nameAr": "Ù…Ù†Ø­ Ø£Ùˆ ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª" },
    { "id": "am-revoke-access", "nameEn": "Revoke Access", "nameAr": "Ø¥Ù„ØºØ§Ø¡ Ø§Ù„ÙˆØµÙˆÙ„" },
    { "id": "am-shared-mailbox", "nameEn": "Shared Mailbox Access", "nameAr": "Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ ØµÙ†Ø¯ÙˆÙ‚ Ø¨Ø±ÙŠØ¯ Ù…Ø´ØªØ±Ùƒ" },
    { "id": "am-distribution-group", "nameEn": "Distribution Group Management", "nameAr": "Ø¥Ø¯Ø§Ø±Ø© Ù…Ø¬Ù…ÙˆØ¹Ø§Øª Ø§Ù„ØªÙˆØ²ÙŠØ¹" },
    { "id": "am-vpn", "nameEn": "VPN Access Request", "nameAr": "Ø·Ù„Ø¨ Ø§Ù„ÙˆØµÙˆÙ„ Ø¹Ø¨Ø± VPN" },
    { "id": "am-mfa", "nameEn": "MFA Setup or Reset", "nameAr": "Ø¥Ø¹Ø¯Ø§Ø¯ Ø£Ùˆ Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© Ø§Ù„Ø«Ù†Ø§Ø¦ÙŠØ©" },
    { "id": "am-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "asset-management": [
    { "id": "ast-register", "nameEn": "Register New Asset", "nameAr": "ØªØ³Ø¬ÙŠÙ„ Ø£ØµÙ„ Ø¬Ø¯ÙŠØ¯" },
    { "id": "ast-transfer", "nameEn": "Asset Transfer Between Employees", "nameAr": "Ù†Ù‚Ù„ Ø£ØµÙ„ Ø¨ÙŠÙ† Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†" },
    { "id": "ast-disposal", "nameEn": "Asset Disposal Request", "nameAr": "Ø·Ù„Ø¨ Ø¥ØªÙ„Ø§Ù Ø£ØµÙ„" },
    { "id": "ast-audit", "nameEn": "Asset Audit / Inventory Check", "nameAr": "Ø¬Ø±Ø¯ Ø£Ùˆ ØªØ¯Ù‚ÙŠÙ‚ Ø§Ù„Ø£ØµÙˆÙ„" },
    { "id": "ast-lost-stolen", "nameEn": "Report Lost or Stolen Asset", "nameAr": "Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø£ØµÙ„ Ù…ÙÙ‚ÙˆØ¯ Ø£Ùˆ Ù…Ø³Ø±ÙˆÙ‚" },
    { "id": "ast-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "change-management": [
    { "id": "cm-standard", "nameEn": "Standard Change Request", "nameAr": "Ø·Ù„Ø¨ ØªØºÙŠÙŠØ± Ø§Ø¹ØªÙŠØ§Ø¯ÙŠ" },
    { "id": "cm-emergency", "nameEn": "Emergency Change Request", "nameAr": "Ø·Ù„Ø¨ ØªØºÙŠÙŠØ± Ø·Ø§Ø±Ø¦" },
    { "id": "cm-normal", "nameEn": "Normal Change Request", "nameAr": "Ø·Ù„Ø¨ ØªØºÙŠÙŠØ± Ø¹Ø§Ø¯ÙŠ" },
    { "id": "cm-system-update", "nameEn": "System or Application Update", "nameAr": "ØªØ­Ø¯ÙŠØ« Ù†Ø¸Ø§Ù… Ø£Ùˆ ØªØ·Ø¨ÙŠÙ‚" },
    { "id": "cm-config", "nameEn": "Configuration Change", "nameAr": "ØªØºÙŠÙŠØ± ÙÙŠ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª" },
    { "id": "cm-rollback", "nameEn": "Rollback Request", "nameAr": "Ø·Ù„Ø¨ Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù† ØªØºÙŠÙŠØ±" },
    { "id": "cm-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "cyber-security": [
    { "id": "cs-antivirus", "nameEn": "Antivirus / Malware Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ù…ÙƒØ§ÙØ­Ø© Ø§Ù„ÙÙŠØ±ÙˆØ³Ø§Øª Ø£Ùˆ Ø§Ù„Ø¨Ø±Ø§Ù…Ø¬ Ø§Ù„Ø¶Ø§Ø±Ø©" },
    { "id": "cs-phishing", "nameEn": "Report Phishing Email", "nameAr": "Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø¨Ø±ÙŠØ¯ ØªØµÙŠØ¯ Ø§Ø­ØªÙŠØ§Ù„ÙŠ" },
    { "id": "cs-suspicious-link", "nameEn": "Report Suspicious Website or Link", "nameAr": "Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù…ÙˆÙ‚Ø¹ Ø£Ùˆ Ø±Ø§Ø¨Ø· Ù…Ø´Ø¨ÙˆÙ‡" },
    { "id": "cs-usb", "nameEn": "USB Access Request", "nameAr": "Ø·Ù„Ø¨ ØªÙØ¹ÙŠÙ„ ÙˆØ­Ø¯Ø© Ø§Ù„ØªØ®Ø²ÙŠÙ† USB" },
    { "id": "cs-nac", "nameEn": "Network Access Control", "nameAr": "Ø§Ù„ØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ø´Ø¨ÙƒØ©" },
    { "id": "cs-data-breach", "nameEn": "Report Suspected Data Breach", "nameAr": "Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø§Ø®ØªØ±Ø§Ù‚ Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø´ØªØ¨Ù‡ Ø¨Ù‡" },
    { "id": "cs-firewall", "nameEn": "Firewall Rule Request", "nameAr": "Ø·Ù„Ø¨ Ù‚Ø§Ø¹Ø¯Ø© Ø¬Ø¯Ø§Ø± Ø­Ù…Ø§ÙŠØ©" },
    { "id": "cs-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "device-replacement": [
    { "id": "dr-computer", "nameEn": "Computer Replacement", "nameAr": "Ø§Ø³ØªØ¨Ø¯Ø§Ù„ Ø¬Ù‡Ø§Ø² Ø­Ø§Ø³Ø¨ Ø¢Ù„ÙŠ" },
    { "id": "dr-printer", "nameEn": "Printer Replacement", "nameAr": "Ø§Ø³ØªØ¨Ø¯Ø§Ù„ Ø·Ø§Ø¨Ø¹Ø©" },
    { "id": "dr-keyboard", "nameEn": "Keyboard Replacement", "nameAr": "Ø§Ø³ØªØ¨Ø¯Ø§Ù„ Ù„ÙˆØ­Ø© Ø§Ù„Ù…ÙØ§ØªÙŠØ­" },
    { "id": "dr-mouse", "nameEn": "Mouse Replacement", "nameAr": "Ø§Ø³ØªØ¨Ø¯Ø§Ù„ ÙØ£Ø±Ø©" },
    { "id": "dr-monitor", "nameEn": "Monitor Replacement", "nameAr": "Ø§Ø³ØªØ¨Ø¯Ø§Ù„ Ø´Ø§Ø´Ø©" },
    { "id": "dr-headset", "nameEn": "Headset Replacement", "nameAr": "Ø§Ø³ØªØ¨Ø¯Ø§Ù„ Ø³Ù…Ø§Ø¹Ø©" },
    { "id": "dr-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "erp-hr": [
    { "id": "ehr-new-user", "nameEn": "New HR Module User", "nameAr": "Ø¥Ù†Ø´Ø§Ø¡ Ù…Ø³ØªØ®Ø¯Ù… ÙÙŠ ÙˆØ­Ø¯Ø© Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ©" },
    { "id": "ehr-role-change", "nameEn": "Change HR Role or Permissions", "nameAr": "ØªØºÙŠÙŠØ± Ø¯ÙˆØ± Ø£Ùˆ ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ©" },
    { "id": "ehr-employee-data", "nameEn": "Employee Data Correction", "nameAr": "ØªØµØ­ÙŠØ­ Ø¨ÙŠØ§Ù†Ø§Øª Ù…ÙˆØ¸Ù" },
    { "id": "ehr-payroll", "nameEn": "Payroll Processing Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø±ÙˆØ§ØªØ¨" },
    { "id": "ehr-leave", "nameEn": "Leave Policy or Setup Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø¥Ø¹Ø¯Ø§Ø¯ Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø¥Ø¬Ø§Ø²Ø§Øª" },
    { "id": "ehr-workflow", "nameEn": "HR Approval Workflow Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ù…Ø³Ø§Ø± Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ©" },
    { "id": "ehr-report", "nameEn": "HR Report Request", "nameAr": "Ø·Ù„Ø¨ ØªÙ‚Ø±ÙŠØ± Ù…ÙˆØ§Ø±Ø¯ Ø¨Ø´Ø±ÙŠØ©" },
    { "id": "ehr-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "erp-other": [
    { "id": "erp-finance", "nameEn": "Finance Module Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ ÙˆØ­Ø¯Ø© Ø§Ù„Ù…Ø§Ù„ÙŠØ©" },
    { "id": "erp-procurement", "nameEn": "Procurement Module Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ ÙˆØ­Ø¯Ø© Ø§Ù„Ù…Ø´ØªØ±ÙŠØ§Øª" },
    { "id": "erp-inventory", "nameEn": "Inventory Module Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ ÙˆØ­Ø¯Ø© Ø§Ù„Ù…Ø®Ø²ÙˆÙ†" },
    { "id": "erp-sales", "nameEn": "Sales Module Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ ÙˆØ­Ø¯Ø© Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª" },
    { "id": "erp-projects", "nameEn": "Projects Module Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ ÙˆØ­Ø¯Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹" },
    { "id": "erp-new-user", "nameEn": "New ERP User Account", "nameAr": "Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ù…Ø³ØªØ®Ø¯Ù… ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù…" },
    { "id": "erp-role-change", "nameEn": "Change ERP Role or Permissions", "nameAr": "ØªØºÙŠÙŠØ± Ø¯ÙˆØ± Ø£Ùˆ ØµÙ„Ø§Ø­ÙŠØ§Øª ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù…" },
    { "id": "erp-data-correction", "nameEn": "Data Entry Correction", "nameAr": "ØªØµØ­ÙŠØ­ Ø¥Ø¯Ø®Ø§Ù„ Ø¨ÙŠØ§Ù†Ø§Øª" },
    { "id": "erp-report", "nameEn": "Custom Report Request", "nameAr": "Ø·Ù„Ø¨ ØªÙ‚Ø±ÙŠØ± Ù…Ø®ØµØµ" },
    { "id": "erp-workflow", "nameEn": "Workflow Approval Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ù…Ø³Ø§Ø± Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯" },
    { "id": "erp-integration", "nameEn": "System Integration Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ ØªÙƒØ§Ù…Ù„ Ø§Ù„Ø£Ù†Ø¸Ù…Ø©" },
    { "id": "erp-training", "nameEn": "ERP Training Request", "nameAr": "Ø·Ù„Ø¨ ØªØ¯Ø±ÙŠØ¨ Ø¹Ù„Ù‰ Ø§Ù„Ù†Ø¸Ø§Ù…" },
    { "id": "erp-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "hr-system": [
    { "id": "hrs-cancel-vacation", "nameEn": "Cancel Rest / Permission / Vacation", "nameAr": "Ø¥Ù„ØºØ§Ø¡ Ø±Ø§Ø­Ø© Ø£Ùˆ Ø§Ø³ØªØ¦Ø°Ø§Ù† Ø£Ùˆ Ø¥Ø¬Ø§Ø²Ø©" },
    { "id": "hrs-vacation-edit", "nameEn": "Edit Vacation Request", "nameAr": "ØªØ¹Ø¯ÙŠÙ„ Ø·Ù„Ø¨ Ø§Ù„Ø¥Ø¬Ø§Ø²Ø©" },
    { "id": "hrs-travel-edit", "nameEn": "Edit Travel Request", "nameAr": "ØªØ¹Ø¯ÙŠÙ„ Ø·Ù„Ø¨ Ø§Ù„Ø§Ù†ØªØ¯Ø§Ø¨" },
    { "id": "hrs-overtime-edit", "nameEn": "Edit Overtime Request", "nameAr": "ØªØ¹Ø¯ÙŠÙ„ Ø·Ù„Ø¨ Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ø¥Ø¶Ø§ÙÙŠ" },
    { "id": "hrs-system-issue", "nameEn": "System Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù…" },
    { "id": "hrs-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "incident-management": [
    { "id": "im-p1", "nameEn": "Critical Incident (P1) â€” Full Outage", "nameAr": "Ø­Ø§Ø¯Ø«Ø© Ø­Ø±Ø¬Ø© (P1) â€” Ø§Ù†Ù‚Ø·Ø§Ø¹ ÙƒØ§Ù…Ù„" },
    { "id": "im-p2", "nameEn": "Major Incident (P2) â€” Partial Outage", "nameAr": "Ø­Ø§Ø¯Ø«Ø© ÙƒØ¨Ø±Ù‰ (P2) â€” Ø§Ù†Ù‚Ø·Ø§Ø¹ Ø¬Ø²Ø¦ÙŠ" },
    { "id": "im-p3", "nameEn": "Minor Incident (P3) â€” Degraded Service", "nameAr": "Ø­Ø§Ø¯Ø«Ø© Ø¨Ø³ÙŠØ·Ø© (P3) â€” ØªØ¯Ù‡ÙˆØ± ÙÙŠ Ø§Ù„Ø®Ø¯Ù…Ø©" },
    { "id": "im-hardware-failure", "nameEn": "Hardware Failure", "nameAr": "Ø¹Ø·Ù„ ÙÙŠ Ø§Ù„Ø¬Ù‡Ø§Ø²" },
    { "id": "im-software-crash", "nameEn": "Software Crash or Error", "nameAr": "ØªÙˆÙ‚Ù Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø£Ùˆ Ø®Ø·Ø£ ØªÙ‚Ù†ÙŠ" },
    { "id": "im-network-outage", "nameEn": "Network Outage", "nameAr": "Ø§Ù†Ù‚Ø·Ø§Ø¹ Ø§Ù„Ø´Ø¨ÙƒØ©" },
    { "id": "im-data-loss", "nameEn": "Data Loss or Corruption", "nameAr": "ÙÙ‚Ø¯Ø§Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø£Ùˆ ØªÙ„ÙÙ‡Ø§" },
    { "id": "im-security-incident", "nameEn": "Security Incident", "nameAr": "Ø­Ø§Ø¯Ø«Ø© Ø£Ù…Ù†ÙŠØ©" },
    { "id": "im-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "knowledge-base": [
    { "id": "kb-new-article", "nameEn": "Request New Knowledge Article", "nameAr": "Ø·Ù„Ø¨ Ø¥Ø¶Ø§ÙØ© Ù…Ù‚Ø§Ù„Ø© Ù…Ø¹Ø±ÙÙŠØ©" },
    { "id": "kb-update-article", "nameEn": "Update Existing Article", "nameAr": "ØªØ­Ø¯ÙŠØ« Ù…Ù‚Ø§Ù„Ø© Ù…ÙˆØ¬ÙˆØ¯Ø©" },
    { "id": "kb-broken-link", "nameEn": "Report Broken Link or Outdated Content", "nameAr": "Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø±Ø§Ø¨Ø· Ù…Ø¹Ø·Ù„ Ø£Ùˆ Ù…Ø­ØªÙˆÙ‰ Ù‚Ø¯ÙŠÙ…" },
    { "id": "kb-access", "nameEn": "Knowledge Base Access Issue", "nameAr": "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ©" },
    { "id": "kb-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "maintenance-service": [
    { "id": "ms-new-request", "nameEn": "New Maintenance Request", "nameAr": "Ø·Ù„Ø¨ ØµÙŠØ§Ù†Ø© Ø¬Ø¯ÙŠØ¯" },
    { "id": "ms-ip-telephone", "nameEn": "IP Telephone Services", "nameAr": "Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ø´Ø¨ÙƒÙŠ" },
    { "id": "ms-car-services", "nameEn": "Car Services", "nameAr": "Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø³ÙŠØ§Ø±Ø©" },
    { "id": "ms-meeting-room", "nameEn": "Meeting Room Request", "nameAr": "Ø·Ù„Ø¨ ØºØ±ÙØ© Ø§Ø¬ØªÙ…Ø§Ø¹" },
    { "id": "ms-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "service-requests": [
    { "id": "sr-new-equipment", "nameEn": "New Equipment Request", "nameAr": "Ø·Ù„Ø¨ Ø¬Ù‡Ø§Ø² Ø¬Ø¯ÙŠØ¯" },
    { "id": "sr-software-install", "nameEn": "Software Installation", "nameAr": "ØªØ«Ø¨ÙŠØª Ø¨Ø±Ù†Ø§Ù…Ø¬" },
    { "id": "sr-peripheral", "nameEn": "Peripheral Device Request", "nameAr": "Ø·Ù„Ø¨ Ø¬Ù‡Ø§Ø² Ø·Ø±ÙÙŠ" },
    { "id": "sr-workspace-setup", "nameEn": "Workspace Setup", "nameAr": "Ø¥Ø¹Ø¯Ø§Ø¯ Ù…ÙƒØ§Ù† Ø§Ù„Ø¹Ù…Ù„" },
    { "id": "sr-onboarding", "nameEn": "New Employee Onboarding", "nameAr": "ØªÙ‡ÙŠØ¦Ø© Ù…ÙˆØ¸Ù Ø¬Ø¯ÙŠØ¯" },
    { "id": "sr-offboarding", "nameEn": "Employee Offboarding", "nameAr": "Ø¥Ù†Ù‡Ø§Ø¡ Ø®Ø¯Ù…Ø§Øª Ù…ÙˆØ¸Ù" },
    { "id": "sr-business-card", "nameEn": "Business Card Request", "nameAr": "Ø·Ù„Ø¨ Ø¨Ø·Ø§Ù‚Ø© Ø¹Ù…Ù„" },
    { "id": "sr-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "software-licensing": [
    { "id": "sl-new-license", "nameEn": "Request New License", "nameAr": "Ø·Ù„Ø¨ ØªØ±Ø®ÙŠØµ Ø¬Ø¯ÙŠØ¯" },
    { "id": "sl-renew-license", "nameEn": "Renew Existing License", "nameAr": "ØªØ¬Ø¯ÙŠØ¯ ØªØ±Ø®ÙŠØµ" },
    { "id": "sl-transfer-license", "nameEn": "Transfer License to Another User", "nameAr": "Ù†Ù‚Ù„ ØªØ±Ø®ÙŠØµ Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¢Ø®Ø±" },
    { "id": "sl-revoke-license", "nameEn": "Revoke License", "nameAr": "Ø¥Ù„ØºØ§Ø¡ ØªØ±Ø®ÙŠØµ" },
    { "id": "sl-upgrade", "nameEn": "Software Upgrade Request", "nameAr": "Ø·Ù„Ø¨ ØªØ±Ù‚ÙŠØ© Ø¨Ø±Ù†Ø§Ù…Ø¬" },
    { "id": "sl-audit", "nameEn": "License Audit / Compliance Check", "nameAr": "ØªØ¯Ù‚ÙŠÙ‚ Ø§Ù„ØªØ±Ø§Ø®ÙŠØµ ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„" },
    { "id": "sl-other", "nameEn": "Other", "nameAr": "Ø£Ø®Ø±Ù‰" }
  ],
  "other": [
    { "id": "general-issue", "nameEn": "Issue", "nameAr": "Ø§Ø°ÙƒØ± Ø§Ù„Ø³Ø¨Ø¨" }
  ]
};

const serviceArabicOverrides = {
  'am-new-account': 'إنشاء حساب مستخدم جديد',
  'am-disable-account': 'تعطيل أو إنهاء حساب مستخدم',
  'am-reset-password': 'إعادة تعيين كلمة المرور',
  'am-unlock-account': 'فتح حساب مقفل',
  'am-grant-permission': 'منح أو تعديل الصلاحيات',
  'am-revoke-access': 'إلغاء الوصول',
  'am-shared-mailbox': 'الوصول إلى صندوق بريد مشترك',
  'am-distribution-group': 'إدارة مجموعات التوزيع',
  'am-vpn': 'طلب الوصول عبر VPN',
  'am-mfa': 'إعداد أو إعادة تعيين المصادقة الثنائية',
  'am-other': 'أخرى',
  'ast-register': 'تسجيل أصل جديد',
  'ast-transfer': 'نقل أصل بين الموظفين',
  'ast-disposal': 'طلب إتلاف أصل',
  'ast-audit': 'جرد أو تدقيق الأصول',
  'ast-lost-stolen': 'الإبلاغ عن أصل مفقود أو مسروق',
  'ast-other': 'أخرى',
  'dr-computer': 'استبدال جهاز حاسوب',
  'dr-printer': 'استبدال طابعة',
  'dr-keyboard': 'استبدال لوحة مفاتيح',
  'dr-mouse': 'استبدال فأرة',
  'dr-monitor': 'استبدال شاشة',
  'dr-headset': 'استبدال سماعة',
  'dr-other': 'أخرى',
  'sr-new-equipment': 'طلب جهاز جديد',
  'sr-software-install': 'تثبيت برنامج',
  'sr-peripheral': 'طلب جهاز طرفي',
  'sr-workspace-setup': 'إعداد مكان العمل',
  'sr-onboarding': 'تهيئة موظف جديد',
  'sr-offboarding': 'إنهاء خدمات موظف',
  'sr-business-card': 'طلب بطاقة عمل',
  'sr-other': 'أخرى',
  'sl-new-license': 'طلب ترخيص جديد',
  'sl-renew-license': 'تجديد ترخيص',
  'sl-transfer-license': 'نقل ترخيص لمستخدم آخر',
  'sl-revoke-license': 'إلغاء ترخيص',
  'sl-upgrade': 'طلب ترقية برنامج',
  'sl-audit': 'تدقيق التراخيص والامتثال',
  'sl-other': 'أخرى',
  'ts-create-account': 'إنشاء حساب مستخدم',
  'ts-device-fix': 'إصلاح مشاكل الجهاز',
  'ts-office-install': 'تثبيت Microsoft Office',
  'ts-user-system-update': 'تحديث الأنظمة المرتبطة بالمستخدم',
  'ts-edit-user': 'تعديل بيانات المستخدم',
  'ts-password-reset': 'طلب إعادة تعيين كلمة المرور',
  'ts-specialized-software': 'تثبيت برنامج متخصص',
  'ts-ms-office': 'تثبيت Microsoft Office',
  'ts-recording': 'طلب تسجيل صوتي',
  'ts-new-device': 'طلب جهاز جديد',
  'ts-monitor': 'طلب شاشة',
  'ts-keyboard-mouse': 'طلب لوحة مفاتيح أو فأرة أو ملحقات',
  'ts-other-support': 'أخرى',
  'general-issue': 'اذكر السبب',
};

  const services = servicesByCategory[category] || [];
  
  const filteredServices = services.filter((service) => {
    const arabicLabel = serviceArabicOverrides[service.id] || '';
    const query = searchQuery.toLowerCase();
    return service.nameEn.toLowerCase().includes(query) || arabicLabel.includes(searchQuery);
  });

  const getArabicLabel = (service) => serviceArabicOverrides[service.id] || '';

  const handleServiceSelect = (service) => {
    if (service.id === 'general-issue') {
      // Don't close modal for "Issue" service, show textarea instead
      onServiceSelect(service);
    } else {
      onServiceSelect(service);
      onClose();
    }
  };

  if (!category) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Select Service</h3>
            <p className="text-xs text-muted-foreground">Choose a service from {categoryLabel || category}.</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" type="button">
              <Icon name="X" size={18} />
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-3">
        <div className="text-xs text-muted-foreground">
          {filteredServices.length} services
        </div>

        <div className="space-y-1">
          {filteredServices.map((service, index) => (
            <button
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-all hover:border-primary/40 hover:bg-primary/5 ${
                selectedService?.id === service.id ? 'border-primary bg-primary/10' : 'border-border bg-background'
              }`}
              type="button"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    selectedService?.id === service.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{service.nameEn}</div>
                      {getArabicLabel(service) && (
                        <div className="text-xs text-muted-foreground truncate" dir="rtl">{getArabicLabel(service)}</div>
                      )}
                    </div>
                </div>
              </div>
              <Icon name="ChevronRight" size={14} className="shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 py-6 text-center text-sm text-muted-foreground">
            No services found
          </div>
        )}

        {selectedService?.id === 'general-issue' && (
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Please specify the reason:
            </label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Please describe your issue in detail..."
            />
            {onClose && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
                  type="button"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSelector;
