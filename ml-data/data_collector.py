import serial
import time
import os
from datetime import datetime
import sys

class DataCollector:
    def __init__(self, port, baud_rate=115200):
        """Initialize the data collector with serial port settings."""
        self.port = port
        self.baud_rate = baud_rate
        self.ser = None
        self.output_dir = "collected_data"
        self.current_file = None
        self.is_collecting = False
        
    def connect(self):
        """Connect to ESP32 via serial port."""
        try:
            self.ser = serial.Serial(self.port, self.baud_rate, timeout=1)
            time.sleep(2)  # Wait for connection to establish
            print(f"✓ Connected to ESP32 on {self.port}")
            
            # Clear any buffered data
            self.ser.reset_input_buffer()
            
            # Check if data logger is ready
            self.ser.write(b"STATUS\n")
            time.sleep(0.5)
            while self.ser.in_waiting:
                response = self.ser.readline().decode('utf-8', errors='ignore').strip()
                print(f"ESP32: {response}")
            
            return True
        except serial.SerialException as e:
            print(f"✗ Error connecting to {self.port}: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from serial port."""
        if self.ser and self.ser.is_open:
            self.ser.close()
            print("✓ Disconnected from ESP32")
    
    def start_collection(self, label):
        """Start data collection with given label."""
        if not self.ser or not self.ser.is_open:
            print("✗ Not connected to ESP32")
            return False
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Create subdirectory for label
        label_dir = os.path.join(self.output_dir, label)
        os.makedirs(label_dir, exist_ok=True)
        
        # Create timestamped filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.join(label_dir, f"{label}_{timestamp}.csv")
        
        # Send START command to ESP32
        command = f"START:{label}\n"
        self.ser.write(command.encode())
        time.sleep(0.5)
        
        # Wait for confirmation and CSV header
        header_found = False
        for _ in range(10):  # Try for 5 seconds
            if self.ser.in_waiting:
                line = self.ser.readline().decode('utf-8', errors='ignore').strip()
                print(f"ESP32: {line}")
                
                if "DATA_LOGGER:START" in line:
                    self.is_collecting = True
                elif line.startswith("timestamp_ms"):
                    # Found CSV header
                    self.current_file = open(filename, 'w')
                    self.current_file.write(line + '\n')
                    header_found = True
                    break
            time.sleep(0.5)
        
        if header_found:
            print(f"✓ Started collecting '{label}' data → {filename}")
            print("  Press Ctrl+C to stop collection")
            return True
        else:
            print("✗ Failed to start collection")
            return False
    
    def stop_collection(self):
        """Stop current data collection."""
        if not self.is_collecting:
            print("✗ Not currently collecting")
            return
        
        # Send STOP command
        self.ser.write(b"STOP\n")
        time.sleep(0.5)
        
        # Read response
        while self.ser.in_waiting:
            line = self.ser.readline().decode('utf-8', errors='ignore').strip()
            print(f"ESP32: {line}")
        
        # Close file
        if self.current_file:
            self.current_file.close()
            self.current_file = None
        
        self.is_collecting = False
        print("✓ Collection stopped")
    
    def collect_loop(self):
        """Main loop to collect and save data."""
        if not self.is_collecting:
            return
        
        try:
            sample_count = 0
            print("\nCollecting data... (Move the helmet/perform actions)")
            
            while self.is_collecting:
                if self.ser.in_waiting:
                    line = self.ser.readline().decode('utf-8', errors='ignore').strip()
                    
                    # Check for control messages
                    if line.startswith("DATA_LOGGER:"):
                        print(f"ESP32: {line}")
                        if "STOP" in line:
                            self.is_collecting = False
                            break
                    # Check if it's a data line (starts with timestamp)
                    elif line and line[0].isdigit():
                        if self.current_file:
                            self.current_file.write(line + '\n')
                            self.current_file.flush()  # Ensure data is written
                            sample_count += 1
                            
                            # Print progress every 50 samples
                            if sample_count % 50 == 0:
                                print(f"  Collected {sample_count} samples...", end='\r')
                
                time.sleep(0.001)  # Small delay to prevent CPU hogging
                
        except KeyboardInterrupt:
            print("\n\n⚠ Interrupted by user")
            self.stop_collection()
        
        print(f"\n✓ Total samples collected: {sample_count}")

def list_serial_ports():
    """List available serial ports."""
    import serial.tools.list_ports
    ports = serial.tools.list_ports.comports()
    return [port.device for port in ports]

def main():
    print("=" * 60)
    print("ESP32 ML Data Collector")
    print("=" * 60)
    
    # List available ports
    ports = list_serial_ports()
    if not ports:
        print("✗ No serial ports found!")
        return
    
    print("\nAvailable serial ports:")
    for i, port in enumerate(ports):
        print(f"  {i+1}. {port}")
    
    # Get port from user
    if len(sys.argv) > 1:
        port = sys.argv[1]
    else:
        port_choice = input(f"\nSelect port (1-{len(ports)}) or enter port name: ").strip()
        if port_choice.isdigit() and 1 <= int(port_choice) <= len(ports):
            port = ports[int(port_choice) - 1]
        else:
            port = port_choice
    
    # Create collector and connect
    collector = DataCollector(port)
    if not collector.connect():
        return
    
    print("\n" + "=" * 60)
    print("Commands:")
    print("  collect <label>  - Start collecting data (e.g., 'collect normal')")
    print("  stop             - Stop current collection")
    print("  status           - Check ESP32 status")
    print("  quit             - Exit program")
    print("=" * 60)
    
    try:
        while True:
            cmd = input("\n> ").strip().lower()
            
            if cmd == "quit" or cmd == "exit":
                break
            
            elif cmd == "status":
                collector.ser.write(b"STATUS\n")
                time.sleep(0.5)
                while collector.ser.in_waiting:
                    response = collector.ser.readline().decode('utf-8', errors='ignore').strip()
                    print(f"ESP32: {response}")
            
            elif cmd.startswith("collect "):
                label = cmd.split(" ", 1)[1]
                if collector.start_collection(label):
                    collector.collect_loop()
            
            elif cmd == "stop":
                collector.stop_collection()
            
            else:
                print("Unknown command. Type 'quit' to exit.")
    
    except KeyboardInterrupt:
        print("\n\n⚠ Exiting...")
    
    finally:
        if collector.is_collecting:
            collector.stop_collection()
        collector.disconnect()
        print("\n✓ Data collection session ended")

if __name__ == "__main__":
    main()
