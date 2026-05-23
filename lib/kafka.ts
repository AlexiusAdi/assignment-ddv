import { Kafka, logLevel } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",");

export const kafka = new Kafka({
  clientId: "article-subscription",
  brokers,
  logLevel: logLevel.WARN,
});

export const KAFKA_TOPIC = process.env.KAFKA_TOPIC ?? "article.published";
export const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID ?? "mailing-service";
