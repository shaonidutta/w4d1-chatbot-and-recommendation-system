---
title: Specification - Model Context Protocol
source_url: https://modelcontextprotocol.io/specification/2025-06-18
scraped_at: 2025-07-02 14:47:12
---

[Model Context Protocol home page](/)

Version 2025-06-18 (latest)

Search...

⌘K

  * [GitHub](https://github.com/modelcontextprotocol)

Search...

Navigation

Protocol

Specification

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

Protocol

Copy page

# Specification

[Model Context Protocol](https://modelcontextprotocol.io) (MCP) is an open
protocol that enables seamless integration between LLM applications and
external data sources and tools. Whether you’re building an AI-powered IDE,
enhancing a chat interface, or creating custom AI workflows, MCP provides a
standardized way to connect LLMs with the context they need.

This specification defines the authoritative protocol requirements, based on
the TypeScript schema in
[schema.ts](https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-06-18/schema.ts).

For implementation guides and examples, visit
[modelcontextprotocol.io](https://modelcontextprotocol.io).

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”,
“SHOULD NOT”, “RECOMMENDED”, “NOT RECOMMENDED”, “MAY”, and “OPTIONAL” in this
document are to be interpreted as described in [BCP
14](https://datatracker.ietf.org/doc/html/bcp14)
[[RFC2119](https://datatracker.ietf.org/doc/html/rfc2119)]
[[RFC8174](https://datatracker.ietf.org/doc/html/rfc8174)] when, and only
when, they appear in all capitals, as shown here.

##

​

Overview

MCP provides a standardized way for applications to:

  * Share contextual information with language models
  * Expose tools and capabilities to AI systems
  * Build composable integrations and workflows

The protocol uses [JSON-RPC](https://www.jsonrpc.org/) 2.0 messages to
establish communication between:

  * **Hosts** : LLM applications that initiate connections
  * **Clients** : Connectors within the host application
  * **Servers** : Services that provide context and capabilities

MCP takes some inspiration from the [Language Server
Protocol](https://microsoft.github.io/language-server-protocol/), which
standardizes how to add support for programming languages across a whole
ecosystem of development tools. In a similar way, MCP standardizes how to
integrate additional context and tools into the ecosystem of AI applications.

##

​

Key Details

###

​

Base Protocol

  * [JSON-RPC](https://www.jsonrpc.org/) message format
  * Stateful connections
  * Server and client capability negotiation

###

​

Features

Servers offer any of the following features to clients:

  * **Resources** : Context and data, for the user or the AI model to use
  * **Prompts** : Templated messages and workflows for users
  * **Tools** : Functions for the AI model to execute

Clients may offer the following features to servers:

  * **Sampling** : Server-initiated agentic behaviors and recursive LLM interactions
  * **Roots** : Server-initiated inquiries into uri or filesystem boundaries to operate in
  * **Elicitation** : Server-initiated requests for additional information from users

###

​

Additional Utilities

  * Configuration
  * Progress tracking
  * Cancellation
  * Error reporting
  * Logging

##

​

Security and Trust & Safety

The Model Context Protocol enables powerful capabilities through arbitrary
data access and code execution paths. With this power comes important security
and trust considerations that all implementors must carefully address.

###

​

Key Principles

  1. **User Consent and Control**

     * Users must explicitly consent to and understand all data access and operations
     * Users must retain control over what data is shared and what actions are taken
     * Implementors should provide clear UIs for reviewing and authorizing activities
  2. **Data Privacy**

     * Hosts must obtain explicit user consent before exposing user data to servers
     * Hosts must not transmit resource data elsewhere without user consent
     * User data should be protected with appropriate access controls
  3. **Tool Safety**

     * Tools represent arbitrary code execution and must be treated with appropriate caution.
       * In particular, descriptions of tool behavior such as annotations should be considered untrusted, unless obtained from a trusted server.
     * Hosts must obtain explicit user consent before invoking any tool
     * Users should understand what each tool does before authorizing its use
  4. **LLM Sampling Controls**

     * Users must explicitly approve any LLM sampling requests
     * Users should control:
       * Whether sampling occurs at all
       * The actual prompt that will be sent
       * What results the server can see
     * The protocol intentionally limits server visibility into prompts

###

​

Implementation Guidelines

While MCP itself cannot enforce these security principles at the protocol
level, implementors **SHOULD** :

  1. Build robust consent and authorization flows into their applications
  2. Provide clear documentation of security implications
  3. Implement appropriate access controls and data protections
  4. Follow security best practices in their integrations
  5. Consider privacy implications in their feature designs

##

​

Learn More

Explore the detailed specification for each protocol component:

## [Architecture](/specification/2025-06-18/architecture)## [Base
Protocol](/specification/2025-06-18/basic)## [Server
Features](/specification/2025-06-18/server)## [Client
Features](/specification/2025-06-18/client)##
[Contributing](/development/contributing)

Was this page helpful?

YesNo

[FAQs](/faqs)[Key Changes](/specification/2025-06-18/changelog)

[github](https://github.com/modelcontextprotocol)

On this page

  * Overview
  * Key Details
  * Base Protocol
  * Features
  * Additional Utilities
  * Security and Trust & Safety
  * Key Principles
  * Implementation Guidelines
  * Learn More

Assistant

Responses are generated using AI and may contain mistakes.


