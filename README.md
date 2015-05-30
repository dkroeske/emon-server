# emon-server
RESTful services translating the flashing led on electricity or gas meter to JSON using a 555 timer chip, Python, NodeJS and a Raspberry PI

Summary

A cheap 555 timer chip acting as Schmitt Trigger combined with a phototransistor or LDR is taped to the flashing LED/light on the electricity meter. See schematic and images in the hardware folder. The output of the 555 chip is connected to a GPIO pin on the Raspberry Pi. A Python script, running in the background, is triggered by the flashing led on the electricity meter. It calculates the actual power usage [Watt] and stores the event in a SQLite database for calculating [kWh]. 
Using Node.js (also running on the RPI) a RESTful service is available to translate database information in to JSON for web or mobile. Also a pimatic plugin is available. 


