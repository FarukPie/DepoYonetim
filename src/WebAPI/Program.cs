using DepoYonetim.Application.Services;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Infrastructure.Data;
using DepoYonetim.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
// builder.Services.AddOpenApi();

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));

builder.Services.AddScoped<IMalzemeKalemiRepository, MalzemeKalemiRepository>();
builder.Services.AddScoped<IKategoriRepository, KategoriRepository>();
builder.Services.AddScoped<IPersonelRepository, PersonelRepository>();
builder.Services.AddScoped<ICariRepository, CariRepository>();
builder.Services.AddScoped<IFaturaRepository, FaturaRepository>();
builder.Services.AddScoped<IZimmetRepository, ZimmetRepository>();
builder.Services.AddScoped<IBolumRepository, BolumRepository>();

// Services

builder.Services.AddScoped<IMalzemeKalemiService, MalzemeKalemiService>();
builder.Services.AddScoped<IKategoriService, KategoriService>();
builder.Services.AddScoped<IBolumService, BolumService>();
builder.Services.AddScoped<IPersonelService, PersonelService>();
builder.Services.AddScoped<ICariService, CariService>();
builder.Services.AddScoped<IFaturaService, FaturaService>();
builder.Services.AddScoped<IZimmetService, ZimmetService>();
builder.Services.AddScoped<ITalepService, TalepService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISystemLogService, SystemLogService>();
builder.Services.AddScoped<ICurrentUserService, DepoYonetim.WebAPI.Services.CurrentUserService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<DataSeeder>();

var app = builder.Build();

// Seed Data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
    
    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    await seeder.SeedAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // app.MapOpenApi();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseMiddleware<DepoYonetim.WebAPI.Middlewares.ExceptionHandlingMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.Run();
