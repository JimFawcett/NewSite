/////////////////////////////////////////////////////////////////////////
// CommService.svc.cs - Implementation of ICommService contract        //
//                                                                     //
// Jim Fawcett, CSE775 - Distributed Objects, Spring 2009              //
/////////////////////////////////////////////////////////////////////////
/*
 * Migrated to CoreWCF. NetTcpBinding dropped (no .NET 5+ client package).
 * Hosts two endpoints:
 *   BasicHttpBinding  at http://localhost:4030/ICommService/BasicHttp
 *   WSHttpBinding     at http://localhost:4040/ICommService/WSHttp
 */

using System;
using System.Threading;
using System.Threading.Tasks;
using CoreWCF;
using CoreWCF.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using SWTools;

namespace CommunicationPrototype
{
  // Single instance so the static BlockingQ is shared across all callers.
  [ServiceBehavior(InstanceContextMode = InstanceContextMode.Single)]
  public class CommService : ICommService
  {
    static BlockingQueue<Message> BlockingQ = new BlockingQueue<Message>();

    public void PostMessage(Message msg)
    {
      BlockingQ.enQ(msg);
    }

    public Message GetMessage()
    {
      return BlockingQ.deQ();
    }

    // Background thread: dequeues and prints messages until "quit"
    static void ProcessMessages()
    {
      while (true)
      {
        Message msg = BlockingQ.deQ();
        string cmdStr = msg.command switch
        {
          Message.Command.DoThis    => "DoThis",
          Message.Command.DoThat    => "DoThat",
          Message.Command.DoAnother => "DoAnother",
          _                         => "unknown"
        };
        Console.Write("\n  received: {0}\t{1}", cmdStr, msg.text);
        if (msg.text == "quit")
          break;
      }
    }

    static async Task Main()
    {
      Console.Write("\n  Communication Server Starting up");
      Console.Write("\n ==================================\n");

      var builder = WebApplication.CreateBuilder(Array.Empty<string>());
      builder.WebHost.ConfigureKestrel(options =>
      {
        options.ListenLocalhost(4030);
        options.ListenLocalhost(4040);
      });
      builder.Services.AddServiceModelServices();
      builder.Services.AddSingleton<CommService>();
      var app = builder.Build();

      app.UseServiceModel(sb =>
      {
        sb.AddService<CommService>();
        sb.AddServiceEndpoint<CommService, ICommService>(
          new BasicHttpBinding(), "/ICommService/BasicHttp");
        sb.AddServiceEndpoint<CommService, ICommService>(
          new WSHttpBinding(SecurityMode.None), "/ICommService/WSHttp");
      });

      var thread = new Thread(ProcessMessages);
      thread.IsBackground = true;
      thread.Start();

      Console.Write("\n  CommService ready:");
      Console.Write("\n    BasicHttp at http://localhost:4030/ICommService/BasicHttp");
      Console.Write("\n    WSHttp    at http://localhost:4040/ICommService/WSHttp");
      Console.Write("\n  Press Ctrl+C to terminate\n");

      await app.RunAsync();
    }
  }
}
