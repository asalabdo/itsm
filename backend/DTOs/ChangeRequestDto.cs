using System;

namespace ITSMBackend.DTOs
{
    public class ChangeRequestDto
    {
        public int Id { get; set; }
        public string ChangeNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string RiskLevel { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? ImplementationPlan { get; set; }
        public string? BackoutPlan { get; set; }
        public string? TestingPlan { get; set; }
        public DateTime? ScheduledStartDate { get; set; }
        public DateTime? ScheduledEndDate { get; set; }
        public UserDto? RequestedBy { get; set; }
        public UserDto? ApprovedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateChangeRequestDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium";
        public string RiskLevel { get; set; } = "Low";
        public string Category { get; set; } = "Normal";
        public string? ImplementationPlan { get; set; }
        public string? BackoutPlan { get; set; }
        public string? TestingPlan { get; set; }
        public DateTime? ScheduledStartDate { get; set; }
        public DateTime? ScheduledEndDate { get; set; }
    }

    public class UpdateChangeRequestDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public string? RiskLevel { get; set; }
        public string? Category { get; set; }
        public string? ImplementationPlan { get; set; }
        public string? BackoutPlan { get; set; }
        public string? TestingPlan { get; set; }
        public DateTime? ScheduledStartDate { get; set; }
        public DateTime? ScheduledEndDate { get; set; }
    }
}
