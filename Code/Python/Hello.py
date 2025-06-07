# Send message to console

class Sender:
    def __init__(self, message):
        self.message = message

    def send(self):
        print("\n" + self.message)

if __name__ == "__main__":
    sender = Sender("Hello Python World!")
    sender.send()
    print("\nThat's all Folks!\n")
