---
title: Introduction - Model Context Protocol
source_url: https://modelcontextprotocol.io/introduction
scraped_at: 2025-07-02 14:47:04
---

[Model Context Protocol home page](/)

Version 2025-06-18 (latest)

Search...

⌘K

  * [GitHub](https://github.com/modelcontextprotocol)

Search...

Navigation

User Guide

Introduction

##### User Guide

  * [Introduction](/introduction)
  * Quickstart

  * Concepts

  * Examples

  * Tutorials

  * [FAQs](/faqs)

##### Protocol

  * [Specification](/specification/2025-06-18)
  * [Key Changes](/specification/2025-06-18/changelog)
  * [Architecture](/specification/2025-06-18/architecture)
  * Base Protocol

  * Client Features

  * Server Features

##### Development

  * [Versioning](/specification/versioning)
  * [Roadmap](/development/roadmap)
  * [Contributing](/development/contributing)

##### SDKs

  * [C# SDK](https://github.com/modelcontextprotocol/csharp-sdk)
  * [Java SDK](https://github.com/modelcontextprotocol/java-sdk)
  * [Kotlin SDK](https://github.com/modelcontextprotocol/kotlin-sdk)
  * [Python SDK](https://github.com/modelcontextprotocol/python-sdk)
  * [Ruby SDK](https://github.com/modelcontextprotocol/ruby-sdk)
  * [Swift SDK](https://github.com/modelcontextprotocol/swift-sdk)
  * [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

User Guide

Copy page

# Introduction

Get started with the Model Context Protocol (MCP)

MCP is an open protocol that standardizes how applications provide context to
LLMs. Think of MCP like a USB-C port for AI applications. Just as USB-C
provides a standardized way to connect your devices to various peripherals and
accessories, MCP provides a standardized way to connect AI models to different
data sources and tools.

##

​

Why MCP?

MCP helps you build agents and complex workflows on top of LLMs. LLMs
frequently need to integrate with data and tools, and MCP provides:

  * A growing list of pre-built integrations that your LLM can directly plug into
  * The flexibility to switch between LLM providers and vendors
  * Best practices for securing your data within your infrastructure

###

​

General architecture

At its core, MCP follows a client-server architecture where a host application
can connect to multiple servers:

  * **MCP Hosts** : Programs like Claude Desktop, IDEs, or AI tools that want to access data through MCP
  * **MCP Clients** : Protocol clients that maintain 1:1 connections with servers
  * **MCP Servers** : Lightweight programs that each expose specific capabilities through the standardized Model Context Protocol
  * **Local Data Sources** : Your computer’s files, databases, and services that MCP servers can securely access
  * **Remote Services** : External systems available over the internet (e.g., through APIs) that MCP servers can connect to

##

​

Get started

Choose the path that best fits your needs:

###

​

Quick Starts

## [For Server DevelopersGet started building your own server to use in Claude
for Desktop and other clients](/quickstart/server)## [For Client DevelopersGet
started building your own client that can integrate with all MCP
servers](/quickstart/client)## [For Claude Desktop UsersGet started using pre-
built servers in Claude for Desktop](/quickstart/user)

###

​

Examples

## [Example ServersCheck out our gallery of official MCP servers and
implementations](/examples)## [Example ClientsView the list of clients that
support MCP integrations](/clients)

##

​

Tutorials

## [Building MCP with LLMsLearn how to use LLMs like Claude to speed up your
MCP development](/tutorials/building-mcp-with-llms)## [Debugging GuideLearn
how to effectively debug MCP servers and
integrations](/docs/tools/debugging)## [MCP InspectorTest and inspect your MCP
servers with our interactive debugging tool](/docs/tools/inspector)## [MCP
Workshop (Video, 2hr)](https://www.youtube.com/watch?v=kQmXtrmQ5Zg)

##

​

Explore MCP

Dive deeper into MCP’s core concepts and capabilities:

## [Core architectureUnderstand how MCP connects clients, servers, and
LLMs](/docs/concepts/architecture)## [ResourcesExpose data and content from
your servers to LLMs](/docs/concepts/resources)## [PromptsCreate reusable
prompt templates and workflows](/docs/concepts/prompts)## [ToolsEnable LLMs to
perform actions through your server](/docs/concepts/tools)## [SamplingLet your
servers request completions from LLMs](/docs/concepts/sampling)##
[TransportsLearn about MCP’s communication
mechanism](/docs/concepts/transports)

##

​

Contributing

Want to contribute? Check out our [Contributing
Guide](/development/contributing) to learn how you can help improve MCP.

##

​

Support and Feedback

Here’s how to get help or provide feedback:

  * For bug reports and feature requests related to the MCP specification, SDKs, or documentation (open source), please [create a GitHub issue](https://github.com/modelcontextprotocol)
  * For discussions or Q&A about the MCP specification, use the [specification discussions](https://github.com/modelcontextprotocol/specification/discussions)
  * For discussions or Q&A about other MCP open source components, use the [organization discussions](https://github.com/orgs/modelcontextprotocol/discussions)
  * For bug reports, feature requests, and questions related to Claude.app and claude.ai’s MCP integration, please see Anthropic’s guide on [How to Get Support](https://support.anthropic.com/en/articles/9015913-how-to-get-support)

Was this page helpful?

YesNo

[For Server Developers](/quickstart/server)

[github](https://github.com/modelcontextprotocol)

On this page

  * Why MCP?
  * General architecture
  * Get started
  * Quick Starts
  * Examples
  * Tutorials
  * Explore MCP
  * Contributing
  * Support and Feedback

Assistant

Responses are generated using AI and may contain mistakes.


