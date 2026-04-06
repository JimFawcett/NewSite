/////////////////////////////////////////////////////////////////////
// Communication.cs - Peer-To-Peer WCF Communicator               //
// ver 2.3                                                         //
// Jim Fawcett, CSE681 - Software Modeling & Analysis, Summer 2011 //
/////////////////////////////////////////////////////////////////////
/*
 * Maintenance History:
 * ====================
 * ver 2.3 : migrated to CoreWCF hosting; Sender uses System.ServiceModel.Http
 * ver 2.2 : 01 Nov 11
 * - Removed unintended local declaration of ServiceHost in Receiver's
 *   CreateReceiveChannel function
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

namespace WCF_Peer_Comm
{
  // Client-side contract — must use System.ServiceModel attributes so
  // ChannelFactory<T> recognises it as a service contract.
  [System.ServiceModel.ServiceContract]
  public interface ICommunicatorClient
  {
    [System.ServiceModel.OperationContract(IsOneWay = true)]
    void PostMessage(string msg);
  }

  /////////////////////////////////////////////////////////////
  // Receiver hosts Communication service used by other Peers

  public class Receiver : ICommunicator
  {
    static BlockingQueue<string> rcvBlockingQ = null!;
    WebApplication _app = null!;

    public Receiver()
    {
      if (rcvBlockingQ == null)
        rcvBlockingQ = new BlockingQueue<string>();
    }

    public void Close()
    {
      _app?.StopAsync().Wait(TimeSpan.FromSeconds(3));
    }

    // Create CoreWCF WebApplication host for Communication service

    public void CreateRecvChannel(string address)
    {
      var uri = new Uri(address);
      int port = uri.Port;
      string path = uri.AbsolutePath;  // e.g. "/ICommunicator"

      var builder = WebApplication.CreateBuilder(Array.Empty<string>());
      builder.WebHost.ConfigureKestrel(options => options.ListenLocalhost(port));
      builder.Services.AddServiceModelServices();
      builder.Services.AddSingleton(this);  // use this instance as the service singleton
      _app = builder.Build();
      _app.UseServiceModel(sb =>
      {
        sb.AddService<Receiver>();
        sb.AddServiceEndpoint<Receiver, ICommunicator>(
          new BasicHttpBinding(), path);
      });

      Task.Run(() => _app.RunAsync());
      Thread.Sleep(500);  // give service time to start
    }

    // Implement service method to receive messages from other Peers

    public void PostMessage(string msg)
    {
      rcvBlockingQ.enQ(msg);
    }

    // Dequeue messages received from other Peers.
    // This will block on an empty queue — caller should use a read thread.

    public string GetMessage()
    {
      return rcvBlockingQ.deQ();
    }
  }

  ///////////////////////////////////////////////////
  // Sender — client of another Peer's Communication service

  public class Sender
  {
    ICommunicatorClient channel = null!;
    System.ServiceModel.ChannelFactory<ICommunicatorClient> factory = null!;
    string lastError = "";
    BlockingQueue<string> sndBlockingQ = null!;
    Thread sndThrd = null!;
    int tryCount = 0, MaxCount = 10;

    // Processing for sndThrd: pulls msgs out of sndBlockingQ and posts them

    void ThreadProc()
    {
      while (true)
      {
        string msg = sndBlockingQ.deQ();
        channel.PostMessage(msg);
        if (msg == "quit")
          break;
      }
    }

    // Create send channel, sndBlockingQ, and start sndThrd

    public Sender(string url)
    {
      sndBlockingQ = new BlockingQueue<string>();
      while (true)
      {
        try
        {
          CreateSendChannel(url);
          tryCount = 0;
          break;
        }
        catch (Exception ex)
        {
          if (++tryCount < MaxCount)
            Thread.Sleep(100);
          else
          {
            lastError = ex.Message;
            break;
          }
        }
      }
      sndThrd = new Thread(ThreadProc);
      sndThrd.IsBackground = true;
      sndThrd.Start();
    }

    // Create proxy to another Peer's Communicator

    public void CreateSendChannel(string address)
    {
      var baseAddress = new System.ServiceModel.EndpointAddress(address);
      var binding = new System.ServiceModel.BasicHttpBinding();
      factory = new System.ServiceModel.ChannelFactory<ICommunicatorClient>(binding, baseAddress);
      channel = factory.CreateChannel();
    }

    // Enqueue message for delivery by sndThrd

    public void PostMessage(string msg)
    {
      sndBlockingQ.enQ(msg);
    }

    public string GetLastError()
    {
      string temp = lastError;
      lastError = "";
      return temp;
    }

    public void Close()
    {
      factory?.Close();
    }
  }
}
