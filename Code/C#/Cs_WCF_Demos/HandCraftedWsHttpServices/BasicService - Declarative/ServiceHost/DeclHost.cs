/////////////////////////////////////////////////////////////////////////
// DeclHost.cs - Service Host for Declarative BasicService demo        //
//                                                                     //
// Jim Fawcett, CSE681 - Software Modeling and Analysis, Fall 2010     //
/////////////////////////////////////////////////////////////////////////
//
// - Started with C# Console Application Project
// - Made reference to .Net System.ServiceModel
// - Added using System.ServiceModel
// - Made reference to IService dll
// - Made reference to Service dll
// - Project->Add New Item->Application Configuration File
// - Added config settings

using System;
using System.Threading.Tasks;
using CoreWCF;
using CoreWCF.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace HandCraftedService
{
  class Host
  {
    static async Task Main(string[] args)
    {
      Console.Write("\n  Starting Declarative WsHttp BasicService");
      Console.Write("\n ==========================================\n");

      var builder = WebApplication.CreateBuilder(args);
      builder.WebHost.ConfigureKestrel(options => options.ListenLocalhost(8080));
      builder.Services.AddServiceModelServices();
      var app = builder.Build();
      app.UseServiceModel(sb =>
      {
        sb.AddService<BasicService>();
        sb.AddServiceEndpoint<BasicService, IBasicService>(
          new WSHttpBinding(SecurityMode.None), "/BasicService");
      });
      Console.Write("\n  Started BasicService at http://localhost:8080/BasicService");
      Console.Write("\n  Press Ctrl+C to exit\n");
      await app.RunAsync();
    }
  }
}
