/////////////////////////////////////////////////////////////////////////
// BasicHttpClient.cs - Consumer of ICommService via BasicHttpBinding  //
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

    void CreateBasicHttpChannel(string url)
    {
      EndpointAddress address = new EndpointAddress(url);
      BasicHttpBinding binding = new BasicHttpBinding();
      channel = new ChannelFactory<ICommService>(binding, address).CreateChannel();
    }

    static void Main()
    {
      Console.Write("\n  BasicHttpClient Starting to Post Messages to Service");
      Console.Write("\n ======================================================\n");

      Client client = new Client();

      int count = 0;
      while (true)
      {
        try
        {
          string url = "http://localhost:4030/ICommService/BasicHttp";
          Console.Write("\n  connecting to \"{0}\"\n", url);
          client.CreateBasicHttpChannel(url);

          Message msg = new Message();
          msg.command = Message.Command.DoThat;
          for (int i = 0; i < 10; ++i)
          {
            msg.text = "BasicHttp message #" + i;
            client.channel.PostMessage(msg);
            Console.Write("\n  sending: {0}", msg.text);
            Thread.Sleep(100);
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
