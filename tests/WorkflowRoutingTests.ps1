$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$assemblyPath = Join-Path $repoRoot 'backend/bin/Debug/net10.0/ITSMBackend.dll'

if (-not (Test-Path $assemblyPath)) {
    throw "Backend assembly not found at $assemblyPath. Build the backend first."
}

$backendBin = Split-Path $assemblyPath
Get-ChildItem $backendBin -Filter '*.dll' | ForEach-Object {
    [void][System.Reflection.Assembly]::LoadFrom($_.FullName)
}

$backendAssembly = [System.Reflection.Assembly]::LoadFrom($assemblyPath)
$rulesType = $backendAssembly.GetType('ITSMBackend.Services.WorkflowRoutingRules')
$ticketType = $backendAssembly.GetType('ITSMBackend.Models.Ticket')
$requestType = $backendAssembly.GetType('ITSMBackend.Models.ServiceRequest')
$catalogType = $backendAssembly.GetType('ITSMBackend.Models.ServiceCatalogItem')
$userRoleType = $backendAssembly.GetType('ITSMBackend.Models.UserRole')

if (-not $rulesType -or -not $ticketType -or -not $requestType -or -not $catalogType) {
    throw 'Failed to load backend types for workflow routing tests.'
}

function New-BackendObject {
    param([System.Type]$Type)
    [System.Activator]::CreateInstance($Type)
}

function Invoke-Static {
    param(
        [System.Type]$Type,
        [string]$MethodName,
        [object[]]$Arguments
    )

    $method = $Type.GetMethod($MethodName, [System.Reflection.BindingFlags]::Public -bor [System.Reflection.BindingFlags]::Static)
    if (-not $method) {
        throw "Could not find method $MethodName on $($Type.FullName)"
    }

    $method.Invoke($null, $Arguments)
}

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Run-Test {
    param(
        [string]$Name,
        [scriptblock]$Body
    )

    & $Body
    Write-Host "PASS $Name"
}

Run-Test 'ticket service key prefers subcategory' {
    $ticket = New-BackendObject $ticketType
    $ticket.Category = 'Hardware'
    $ticket.Subcategory = 'Laptop'

    $result = Invoke-Static $rulesType 'GetTicketServiceKey' @($ticket)
    Assert-True ($result -eq 'Laptop') 'Expected subcategory to win'
}

Run-Test 'service request service key prefers request type' {
    $request = New-BackendObject $requestType
    $request.ServiceType = 'VPN Access'

    $catalog = New-BackendObject $catalogType
    $catalog.Name = 'Laptop'

    $result = Invoke-Static $rulesType 'GetServiceRequestServiceKey' @($request, $catalog)
    Assert-True ($result -eq 'VPN Access') 'Expected request service type to win'
}

Run-Test 'workflow definition matches entity service and org' {
    $steps = Invoke-Static $rulesType 'BuildStepDefinitions' @('Ticket', 'High')
    $definition = Invoke-Static $rulesType 'BuildWorkflowDefinition' @('Ticket', 'vpn access', 'finance', $steps)

    Assert-True (Invoke-Static $rulesType 'MatchesWorkflowDefinition' @($definition, 'Ticket', 'vpn access', 'finance')) 'Expected workflow to match'
    Assert-True (-not (Invoke-Static $rulesType 'MatchesWorkflowDefinition' @($definition, 'ServiceRequest', 'vpn access', 'finance'))) 'Expected entity kind mismatch'
}

Run-Test 'service request templates include manager review' {
    $steps = Invoke-Static $rulesType 'BuildStepDefinitions' @('ServiceRequest', 'Medium')

    Assert-True ($steps.Count -eq 2) 'Expected two service request steps'
    Assert-True ($steps[0].StepType -eq 'Approval') 'Expected first step to be approval'
    Assert-True ($steps[0].TargetRoles -contains 'Manager') 'Expected manager role in approval step'
}

$sampleDefinition = [System.Text.Json.JsonSerializer]::Serialize([pscustomobject]@{
    entityKinds = @('Ticket')
    serviceKey = '*'
    organizationKey = 'finance'
})

Run-Test 'wildcard service key matches' {
    Assert-True (Invoke-Static $rulesType 'MatchesWorkflowDefinition' @($sampleDefinition, 'Ticket', 'anything', 'finance')) 'Expected wildcard service key to match'
}

Write-Host 'All workflow routing tests passed.'
