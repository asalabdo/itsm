using AutoMapper;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Helpers;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>().ReverseMap();
        CreateMap<CreateUserDto, User>();
        CreateMap<UpdateUserDto, User>();

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

        // Asset mappings
        CreateMap<Asset, AssetDto>().ReverseMap();
        CreateMap<CreateAssetDto, Asset>();
        CreateMap<UpdateAssetDto, Asset>();

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

        // Dashboard mappings
        CreateMap<DashboardMetric, DashboardMetricDto>();
        CreateMap<PerformanceMetric, PerformanceMetricDto>();
    }
}
