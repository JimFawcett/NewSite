///////////////////////////////////////////////////////////////////
// Strings.cs - WCF Strings Service in Self Hosted Configuration //
//                                                               //
// Jim Fawcett, CSE775 - Distributed Objects, Spring 2009        //
///////////////////////////////////////////////////////////////////

using System;
using System.Threading.Tasks;
using CoreWCF;
using CoreWCF.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace CSE775
{
  [ServiceBehavior(InstanceContextMode = InstanceContextMode.Single)]
  public class Strings : IStrings
  {
    string str_ = "";

    public void putString(string str)
    {
      Console.Write("\n  received, in putString, \"{0}\"", str);
      str_ = str;
    }

    public void putRefString(ref string str)
    {
      Console.Write("\n  received, in putRefString, \"{0}\"", str);
      str = "ref string";
      Console.Write("\n  modified string to \"{0}\"", str);
    }

    public string getString()
    {
      Console.Write("\n  sending, from getString, \"{0}\"", str_);
      return str_;
    }

    public void getOutString(out string str)
    {
      str = "out string";
      Console.Write("\n  sending, from getOutString, \"{0}\"", str);
    }

    static async Task Main()
    {
      Console.Write("\n  SelfHosted Strings Service started");
      Console.Write("\n ====================================\n");

      var builder = WebApplication.CreateBuilder();
      builder.WebHost.ConfigureKestrel(options => options.ListenLocalhost(8080));
      builder.Services.AddServiceModelServices();
      var app = builder.Build();
      app.UseServiceModel(sb =>
      {
        sb.AddService<Strings>();
        sb.AddServiceEndpoint<Strings, IStrings>(
          new WSHttpBinding(SecurityMode.None), "/Strings");
      });
      Console.Write("\n  Listening at http://localhost:8080/Strings");
      Console.Write("\n  Press Ctrl+C to terminate service\n");
      await app.RunAsync();
    }
  }
}
