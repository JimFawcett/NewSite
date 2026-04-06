///////////////////////////////////////////////////////////////////////
// StreamService.cs - WCF StreamService in Self Hosted Configuration //
//                                                                   //
// Jim Fawcett, CSE681 - Software Modeling and Analysis, Summer 2009 //
///////////////////////////////////////////////////////////////////////
/*
 * Note:
 * - Uses Programmatic configuration, no app.config file used.
 * - Uses ChannelFactory to create proxy programmatically. 
 * - Expects to find ToSend directory under application with files
 *   to send.
 * - Will create SavedFiles directory if it does not already exist.
 */

using System;
using System.IO;
using System.Threading.Tasks;
using CoreWCF;
using CoreWCF.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace CSE681
{
  [ServiceBehavior(IncludeExceptionDetailInFaults=true)]
  public class StreamService : IStreamService
  {
    string savePath = "SavedFiles";
    string ToSendPath = "ToSend";

    public bool upLoadFile(string filename, byte[] data)
    {
      string rfilename = Path.Combine(savePath, filename);
      if (!Directory.Exists(savePath))
        Directory.CreateDirectory(savePath);
      File.WriteAllBytes(rfilename, data);
      Console.Write("\n  Received file \"{0}\" ({1} bytes)", filename, data.Length);
      return true;
    }

    public byte[] downLoadFile(string filename)
    {
      string sfilename = Path.Combine(ToSendPath, filename);
      if (File.Exists(sfilename))
      {
        Console.Write("\n  Sending file \"{0}\"", filename);
        return File.ReadAllBytes(sfilename);
      }
      throw new Exception("open failed for \"" + filename + "\"");
    }

    public static async Task Main()
    {
      Console.Write("\n  SelfHosted File Stream Service started");
      Console.Write("\n ========================================\n");

      var builder = WebApplication.CreateBuilder();
      builder.WebHost.ConfigureKestrel(options =>
      {
        options.ListenLocalhost(8010);
        options.AllowSynchronousIO = true;
      });
      builder.Services.AddServiceModelServices();

      var app = builder.Build();
      app.UseServiceModel(serviceBuilder =>
      {
        serviceBuilder.AddService<StreamService>();
        var binding = new BasicHttpBinding();
        binding.MaxReceivedMessageSize = 50000000;
        serviceBuilder.AddServiceEndpoint<StreamService, IStreamService>(binding, "/StreamService");
      });

      Console.Write("\n  Listening at http://localhost:8010/StreamService");
      Console.Write("\n  Press Ctrl+C to terminate service\n");
      await app.RunAsync();
    }
  }
}
