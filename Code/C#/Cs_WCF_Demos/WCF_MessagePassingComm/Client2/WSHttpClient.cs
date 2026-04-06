/////////////////////////////////////////////////////////////////////////
// WSHttpClient.cs - Consumer of ICommService via WSHttpBinding        //
//                                                                     //
// Jim Fawcett, CSE775 - Distributed Objects, Spring 2009              //
/////////////////////////////////////////////////////////////////////////

using System;
using System.ServiceModel;
using System.Threading;

namespace CommunicationPrototype
{
  class Client
  {
    ICommService channel = null!;

    void CreateWSHttpChannel(string url)
    {
      EndpointAddress address = new EndpointAddress(url);
      WSHttpBinding binding = new WSHttpBinding(SecurityMode.None);
      channel = new ChannelFactory<ICommService>(binding, address).CreateChannel();
    }

    static void Main()
    {
      Console.Write("\n  WSHttpClient Starting to Post Messages to Service");
      Console.Write("\n ===================================================\n");

      Thread.Sleep(500);  // stagger startup

      Client client = new Client();

      int count = 0;
      while (true)
      {
        try
        {
          string url = "http://localhost:4040/ICommService/WSHttp";
          Console.Write("\n  connecting to \"{0}\"\n", url);
          client.CreateWSHttpChannel(url);

          Message msg = new Message();
          msg.command = Message.Command.DoThis;
          for (int i = 0; i < 10; ++i)
          {
            msg.text = "WSHttp message #" + i;
            client.channel.PostMessage(msg);
            Console.Write("\n  sending: {0}", msg.text);
            Thread.Sleep(200);
          }

          ((ICommunicationObject)client.channel).Close();
          break;
        }
        catch (Exception ex)
        {
          Console.Write("\n  connection failed {0} times: {1}", ++count, ex.Message);
          if (count >= 10) break;
          Thread.Sleep(500);
        }
      }
      Console.Write("\n\n");
    }
  }
}
