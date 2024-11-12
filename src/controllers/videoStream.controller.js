import { asyncHandler } from "../utils/asyncHandler.js";
import mediasoup from "mediasoup";
let worker, router;
let producerTransport, producer;
const transports = new Map();

async function createMediasoupWorker() {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({
    mediaCodecs: [{ kind: "video", mimeType: "video/VP8", clockRate: 90000 }],
  });
  //   console.log("Mediasoup router created with codecs", router.rtpCapabilities);
}

createMediasoupWorker();

// Step 1: Function to get RTP Capabilities
export async function getRtpCapabilities(req, res) {
  res.json({ rtpCapabilities: router.rtpCapabilities });
}

// Step 2: Function to create WebRTC transport
export async function createTransport(req, res) {
  try {
    producerTransport = await router.createWebRtcTransport({
      listenIps: [
        { ip: "0.0.0.0", announcedIp: "https://backend-sangya.onrender.com" },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    transports.set(producerTransport.id, producerTransport);

    res.json({
      id: producerTransport.id,
      iceParameters: producerTransport.iceParameters,
      iceCandidates: producerTransport.iceCandidates,
      dtlsParameters: producerTransport.dtlsParameters,
    });
  } catch (error) {
    console.error("Error during transport creation:", error);
    res.status(500).json({ error: "Failed to create transport" });
  }
}

export const connectStream = async (req, res) => {
  try {
    // Step 1: Get the transport ID and DTLS parameters from the request body
    const { transportId, dtlsParameters } = req.body;

    // Step 2: Find the producer transport using the transport ID
    const transport = transports.get(transportId);
    // console.log(producerTransport);

    // Step 3: Connect the transport using the received DTLS parameters
    if (!transport) {
      return res.status(400).json({ error: "Transport not found" });
    }

    await transport.connect({ dtlsParameters });

    // Step 4: Send a response indicating successful transport connection
    res.json({ status: "Transport connected" });
  } catch (error) {
    console.error("Error connecting transport:", error);
    res.status(500).json({ error: "Failed to connect transport" });
  }
};
// Step 3: Function to connect transport and start receiving video
export async function startProduce(req, res) {
  try {
    const { dtlsParameters, kind, rtpParameters } = req.body;

    // Validate if 'kind' is provided
    if (!kind) {
      return res
        .status(400)
        .json({ error: "Invalid kind, it must be 'video' or 'audio'" });
    }

    // Connect transport if DTLS parameters are provided
    // if (dtlsParameters) {
    //   await producerTransport.connect({ dtlsParameters });
    //   res.json({ status: "Transport connected" });
    // }

    // Produce media (either video or audio)
    if (kind && rtpParameters) {
      const producer1 = await producerTransport.produce({
        kind,
        rtpParameters,
      });
      producer = producer1;
      res.json({ id: producer1.id });
    } else {
      res.status(400).json({ error: "Missing rtpParameters or kind" });
    }
  } catch (error) {
    console.error("Error during producing video:", error);
    res.status(500).json({ error: "Failed to produce video stream" });
  }
}

export async function createConsumerTransport(req, res) {
  try {
    const consumerTransport = await router.createWebRtcTransport({
      listenIps: [
        { ip: "0.0.0.0", announcedIp: "https://backend-sangya.onrender.com" },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    transports.set(consumerTransport.id, consumerTransport);

    res.json({
      id: consumerTransport.id,
      iceParameters: consumerTransport.iceParameters,
      iceCandidates: consumerTransport.iceCandidates,
      dtlsParameters: consumerTransport.dtlsParameters,
    });
  } catch (error) {
    console.error("Error creating consumer transport:", error);
    res.status(500).json({ error: "Failed to create consumer transport" });
  }
}

export const connectConsumerTransport = async (req, res) => {
  try {
    const { transportId, dtlsParameters } = req.body;
    const transport = transports.get(transportId);

    if (!transport) {
      return res.status(404).json({ error: "Transport not found" });
    }

    await transport.connect({ dtlsParameters });
    res.json({ status: "Transport connected" });
  } catch (error) {
    console.error("Error connecting consumer transport:", error);
    res.status(500).json({ error: "Failed to connect consumer transport" });
  }
};
export async function consume(req, res) {
  try {
    const { transportId, rtpCapabilities } = req.body;

    // Ensure the router can consume this producer with the given RTP capabilities
    console.log("Producer:", producer);
    console.log("RTP Capabilities:", rtpCapabilities);

    if (!producer) {
      return res.status(400).json({ error: "Producer not found" });
    }

    if (
      !rtpCapabilities ||
      !rtpCapabilities.codecs ||
      !rtpCapabilities.headerExtensions
    ) {
      return res.status(400).json({ error: "Invalid RTP Capabilities" });
    }

    if (!router.canConsume({ producerId: producer.id, rtpCapabilities })) {
      return res.status(400).json({ error: "Cannot consume media" });
    }

    const transport = transports.get(transportId);
    if (!transport) {
      return res.status(404).json({ error: "Transport not found" });
    }

    // Create a consumer for the producer's media
    const consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: false,
    });

    res.json({
      consumerId: consumer.id,
      producerId: producer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    });
  } catch (error) {
    console.log(router);

    console.error("Error creating consumer:", error);
    res.status(500).json({ error: "Failed to create consumer" });
  }
}
