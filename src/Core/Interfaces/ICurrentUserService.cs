namespace DepoYonetim.Core.Interfaces;

public interface ICurrentUserService
{
    int? UserId { get; }
    string UserName { get; }
}
