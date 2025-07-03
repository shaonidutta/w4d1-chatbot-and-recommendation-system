# MCP Troubleshooting Guide

## Common Issues and Solutions

### Server Connection Issues

#### Problem: MCP Server Won't Connect
**Symptoms:**
- Server appears offline in Claude Desktop
- Connection timeout errors
- "Failed to connect" messages

**Solutions:**
1. **Check Server Status**
   - Verify server process is running
   - Check if server executable exists at specified path
   - Use absolute paths in configuration

2. **Configuration Issues**
   - Verify `claude_desktop_config.json` syntax
   - Check for missing required fields
   - Ensure proper JSON formatting

3. **Path Problems**
   - Use absolute paths instead of relative paths
   - Verify file permissions
   - Check working directory issues

#### Problem: Environment Variables Not Working
**Symptoms:**
- Server can't access API keys
- Missing configuration values
- Authentication failures

**Solutions:**
1. **Explicit Environment Configuration**
   ```json
   {
     "myserver": {
       "command": "mcp-server-myapp",
       "env": {
         "MYAPP_API_KEY": "your_key_here",
         "NODE_ENV": "production"
       }
     }
   }
   ```

2. **Check Inherited Variables**
   - Only USER, HOME, and PATH are inherited automatically
   - Explicitly define all required environment variables

### Server Initialization Problems

#### Problem: Server Fails to Start
**Common Causes:**
1. **Path Issues**
   - Incorrect server executable path
   - Missing required files
   - Permission problems

2. **Configuration Errors**
   - Invalid JSON syntax
   - Missing required fields
   - Type mismatches

3. **Environment Problems**
   - Missing environment variables
   - Incorrect variable values
   - Permission restrictions

**Debugging Steps:**
1. Test server standalone with MCP Inspector
2. Check Claude Desktop logs: `~/Library/Logs/Claude/mcp*.log`
3. Verify server executable permissions
4. Use absolute paths in configuration

### Working Directory Issues

#### Problem: Relative Paths Don't Work
**Explanation:**
- Claude Desktop working directory may be undefined (like `/` on macOS)
- Servers launched via `claude_desktop_config.json` inherit unpredictable working directory

**Solution:**
Always use absolute paths:
```json
{
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "/Users/username/data"
  ]
}
```

Instead of:
```json
{
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "./data"
  ]
}
```

### Protocol and Communication Issues

#### Problem: Message Exchange Failures
**Symptoms:**
- Incomplete responses
- Timeout errors
- Protocol version mismatches

**Solutions:**
1. **Check Protocol Compatibility**
   - Verify client and server use compatible MCP versions
   - Update to latest SDK versions

2. **Message Size Limits**
   - Large responses may be truncated
   - Implement pagination for large datasets

3. **Network Issues**
   - Check firewall settings
   - Verify network connectivity
   - Test with local servers first

### Performance Issues

#### Problem: Slow Server Response
**Common Causes:**
1. **Large Data Processing**
   - Inefficient database queries
   - Large file operations
   - Memory constraints

2. **Network Latency**
   - Remote API calls
   - Slow external services
   - Connection overhead

**Optimization Strategies:**
1. **Implement Caching**
   - Cache frequently accessed data
   - Use appropriate cache invalidation
   - Consider memory vs. disk caching

2. **Optimize Queries**
   - Use database indexes
   - Limit result sets
   - Implement pagination

3. **Async Operations**
   - Use non-blocking I/O
   - Implement proper error handling
   - Consider background processing

### Authentication and Security Issues

#### Problem: Authentication Failures
**Common Issues:**
1. **API Key Problems**
   - Expired or invalid keys
   - Incorrect key format
   - Missing permissions

2. **OAuth Issues**
   - Token expiration
   - Scope limitations
   - Redirect URI mismatches

**Solutions:**
1. **Verify Credentials**
   - Test API keys independently
   - Check expiration dates
   - Verify required permissions

2. **Implement Token Refresh**
   - Handle token expiration gracefully
   - Implement automatic refresh
   - Store tokens securely

### Logging and Debugging

#### Problem: Insufficient Debugging Information
**Best Practices:**
1. **Server-Side Logging**
   ```python
   server.request_context.session.send_log_message(
       level="info",
       data="Server started successfully"
   )
   ```

2. **Important Events to Log**
   - Initialization steps
   - Resource access attempts
   - Tool execution results
   - Error conditions
   - Performance metrics

3. **Client-Side Debugging**
   - Enable Chrome DevTools in Claude Desktop
   - Monitor network traffic
   - Track message exchanges

### Platform-Specific Issues

#### macOS Issues
1. **Permission Problems**
   - Grant necessary file system permissions
   - Check Gatekeeper restrictions
   - Verify code signing

2. **Path Resolution**
   - Use full paths for executables
   - Check PATH environment variable
   - Verify shell environment

#### Windows Issues
1. **Path Separators**
   - Use forward slashes or escaped backslashes
   - Handle drive letters correctly

2. **PowerShell vs Command Prompt**
   - Specify correct shell for execution
   - Handle environment variable syntax

### Error Messages and Solutions

#### "Server not found" or "Command not found"
- Verify server executable path
- Check if dependencies are installed
- Use absolute paths

#### "Permission denied"
- Check file permissions
- Verify user access rights
- Run with appropriate privileges

#### "Protocol version mismatch"
- Update MCP SDK to latest version
- Check compatibility matrix
- Verify client/server versions

#### "Timeout waiting for server"
- Increase timeout values
- Check server startup time
- Verify server initialization

### Getting Help

#### Before Seeking Support
1. **Gather Information**
   - Server logs
   - Configuration files
   - Error messages
   - Steps to reproduce

2. **Test Isolation**
   - Use MCP Inspector for testing
   - Test with minimal configuration
   - Verify basic connectivity

#### Support Channels
1. **GitHub Issues**
   - Report bugs with detailed information
   - Include reproduction steps
   - Provide environment details

2. **GitHub Discussions**
   - Ask questions
   - Share experiences
   - Get community help

#### Providing Effective Bug Reports
1. **Include Context**
   - Operating system and version
   - MCP SDK version
   - Server configuration
   - Error logs

2. **Reproduction Steps**
   - Minimal test case
   - Expected vs actual behavior
   - Consistent reproduction method
