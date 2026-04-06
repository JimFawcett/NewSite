///////////////////////////////////////////////////////////////
// Client.cs - WCF SelfHosted Strings Service client         //
//                                                           //
// Jim Fawcett, CSE775 - Distributed Objects, Spring 2008    //
///////////////////////////////////////////////////////////////

using System;
using System.ServiceModel;
using System.Threading;

namespace CSE775
{
  class Client
  {
    static IStrings CreateServiceChannel(string url)
    {
      WSHttpBinding binding = new WSHttpBinding(SecurityMode.None);
      EndpointAddress address = new EndpointAddress(url);
      ChannelFactory<IStrings> factory = new ChannelFactory<IStrings>(binding, address);
      return factory.CreateChannel();
    }

    static void Main()
    {
      Console.Write("\n  Client of SelfHosted Strings service");
      Console.Write("\n ======================================\n");

      Thread.Sleep(2500);  // give server time to start

      IStrings channel = CreateServiceChannel("http://localhost:8080/Strings");

      string str = "a not very important message";
      Console.Write("\n  sending:  \"{0}\"", str);
      channel.putString(str);
      Console.Write("\n  received: \"{0}\"", channel.getString());

      str = "a modifiable string";
      Console.Write("\n  sending \"{0}\"", str);
      channel.putRefString(ref str);
      Console.Write("\n  string modified to: \"{0}\"", str);

      channel.getOutString(out str);
      Console.Write("\n  received out parameter: \"{0}\"", str);

      Console.Write("\n\n");
      ((IClientChannel)channel).Close();
    }
  }
}
