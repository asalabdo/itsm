using AutoMapper;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Helpers;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()))
            .ReverseMap()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => Enum.Parse<UserRole>(src.Role)));

        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => Enum.Parse<UserRole>(src.Role)));

        CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.Role, opt => opt.Condition(src => !string.IsNullOrEmpty(src.Role)))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => Enum.Parse<UserRole>(src.Role!)));

        // Ticket mappings
        CreateMap<Ticket, TicketDto>()
            .ForMember(dest => dest.CommentCount, opt => opt.MapFrom(src => src.Comments.Count))
            .ForMember(dest => dest.ActivityCount, opt => opt.MapFrom(src => src.Activities.Count));

        CreateMap<Ticket, TicketDetailDto>()
            .ForMember(dest => dest.CommentCount, opt => opt.MapFrom(src => src.Comments.Count))
            .ForMember(dest => dest.ActivityCount, opt => opt.MapFrom(src => src.Activities.Count));

        CreateMap<CreateTicketDto, Ticket>();
        CreateMap<UpdateTicketDto, Ticket>();

        CreateMap<TicketComment, TicketCommentDto>();
        CreateMap<TicketActivity, TicketActivityDto>();
        CreateMap<TicketAttachment, TicketAttachmentDto>()
            .ForMember(dest => dest.FileUrl, opt => opt.MapFrom(src => $"/api/tickets/{src.TicketId}/attachments/{src.Id}"));

        // Service Request mappings
        CreateMap<ServiceCatalogItem, ServiceCatalogItemDto>();
        CreateMap<ServiceRequest, ServiceRequestDto>()
            .ForMember(dest => dest.CatalogItemName, opt => opt.MapFrom(src => src.CatalogItem != null ? src.CatalogItem.Name : "General"))
            .ForMember(dest => dest.CatalogItemNameAr, opt => opt.MapFrom(src => src.CatalogItem != null ? src.CatalogItem.NameAr : "عام"));
        CreateMap<ApprovalRequest, ApprovalRequestDto>()
            .ForMember(dest => dest.ApproverName, opt => opt.MapFrom(src => src.Approver != null ? src.Approver.Username : "System"));
        CreateMap<FulfillmentTask, FulfillmentTaskDto>()
            .ForMember(dest => dest.AssignedToName, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.Username : "Unassigned"));
        CreateMap<CreateServiceRequestDto, ServiceRequest>();

        // Asset mappings
        CreateMap<Asset, AssetDto>()
            .ForMember(dest => dest.History, opt => opt.MapFrom(src => src.History))
            .ReverseMap();
        CreateMap<CreateAssetDto, Asset>();
        CreateMap<UpdateAssetDto, Asset>();
        
        CreateMap<AssetHistory, AssetHistoryDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.Username));

        CreateMap<AssetRelationship, AssetRelationshipDto>()
            .ForMember(dest => dest.SourceAssetName, opt => opt.MapFrom(src => src.SourceAsset.Name))
            .ForMember(dest => dest.TargetAssetName, opt => opt.MapFrom(src => src.TargetAsset.Name));

        CreateMap<CreateAssetRelationshipDto, AssetRelationship>();

        // Automation mappings
        CreateMap<AutomationRule, AutomationRuleDto>().ReverseMap();
        CreateMap<CreateAutomationRuleDto, AutomationRule>();
        CreateMap<AutomationExecutionLog, AutomationExecutionLogDto>()
            .ForMember(dest => dest.RuleName, opt => opt.MapFrom(src => src.Rule.Name));

        // ChangeRequest mappings
        CreateMap<ChangeRequest, ChangeRequestDto>().ReverseMap();
        CreateMap<CreateChangeRequestDto, ChangeRequest>();
        CreateMap<UpdateChangeRequestDto, ChangeRequest>();

        // ServiceRequest mappings
        CreateMap<ServiceRequest, ServiceRequestDto>().ReverseMap();
        CreateMap<CreateServiceRequestDto, ServiceRequest>();
        CreateMap<UpdateServiceRequestDto, ServiceRequest>();

        // ApprovalItem mappings
        CreateMap<ApprovalItem, ApprovalItemDto>().ReverseMap();
        CreateMap<UpdateApprovalItemDto, ApprovalItem>();

        // Workflow mappings
        CreateMap<Workflow, WorkflowDto>().ReverseMap();
        CreateMap<CreateWorkflowDto, Workflow>();
        CreateMap<UpdateWorkflowDto, Workflow>();
        CreateMap<WorkflowStep, WorkflowStepDto>().ReverseMap();
        CreateMap<WorkflowInstance, WorkflowInstanceDto>().ReverseMap();

        // Problem management mappings
        CreateMap<ProblemRecord, ProblemRecordDto>().ReverseMap();
        CreateMap<CreateProblemRecordDto, ProblemRecord>();
        CreateMap<UpdateProblemRecordDto, ProblemRecord>();

        // Dashboard mappings
        CreateMap<DashboardMetric, DashboardMetricDto>();
        CreateMap<PerformanceMetric, PerformanceMetricDto>();
    }
}
