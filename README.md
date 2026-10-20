# Fleet Simulator Dashboard

A local-first fleet telemetry dashboard built with React, TypeScript,
Ant Design, and DuckDB-Wasm. The application simulates telemetry for a
fleet of vehicles, stores packet data in the browser, and presents
fleet-level status alongside per-vehicle telemetry logs.

## Features

-   **Fleet overview:** Displays a table of 500 simulated vehicles with
    current status and key telemetry values.
-   **Status filtering:** Filter vehicles by their current calculated
    status.
-   **Vehicle detail:** Open an individual vehicle to review its
    metadata and telemetry packet logs.
-   **Telemetry simulation:** Generates partial packets, occasional
    duplicate replays, late-arriving packets, missed reporting
    intervals, and delayed packets.
-   **Browser-side persistence:** Uses DuckDB-Wasm with OPFS and an
    IndexedDB packet archive to restore stored telemetry after a reload,
    subject to browser storage availability and retention limits.
-   **Duplicate protection:** Uses packet IDs as the packet identity,
    preventing a replay of the same packet ID from being inserted again.
-   **Automated tests:** Run the project test suite using the commands
    below.

## Tech stack

-   React
-   TypeScript
-   Ant Design
-   DuckDB-Wasm
-   IndexedDB
-   Browser Origin Private File System (OPFS)
-   Project build tooling configured in `package.json`

## Getting started

### Requirements

Use a recent browser with support for the browser storage features
required by DuckDB-Wasm and OPFS. Exact browser compatibility and
behavior can vary; see [Limitations](#limitations).

### Install and run

``` bash
npm install
npm run dev
```

Open the local URL printed by the development server.

### Run tests

Run the test suite:

``` bash
npm test
```

Run the vehicle page test file selectively:

``` bash
npm test -- src/pages/Vehicle/Vehicle.test.tsx
```

## Project structure

The main source code is organized as follows:

``` text
src/
  pages/
    <Page>/          Page-specific components and tests
  components/        Shared components (currently empty)
  dbUtils/           Database-related utilities
  appUtils/          Application-related utilities
  router/
    router.tsx        Route configuration
  App.tsx             Application root
```

Page-specific components live alongside their page under
`src/pages/<Page>`. The top-level `src/components` directory is
currently empty because the implementation did not require additional
shared components.

## Architecture and data flow

The dashboard connects the UI, the database, the telemetry simulator,
and an in-memory view of the latest vehicle values.

1.  On startup, the application initializes DuckDB-Wasm and creates the
    required tables if they do not exist.
2.  It restores archived telemetry from IndexedDB and merges packets
    into DuckDB, ignoring packet IDs that are already present.
3.  The simulator starts and generates telemetry for the configured
    fleet. The dashboard currently uses 500 vehicles and a 1,000 ms
    simulator tick.
4.  New packets are committed to DuckDB in batches. After a commit, the
    dashboard's revision counter changes, triggering a query of
    `telemetry_packets`.
5.  Queried packet data is passed to the vehicle-state logic, which
    merges signal values into vehicle rows. Partial batches are flushed
    so the UI can display available data without waiting indefinitely
    for a full batch.
6.  The dashboard displays the resulting current vehicle state. The
    vehicle detail page provides access to vehicle metadata and packet
    logs.

The UI's displayed vehicle rows are derived from database packet data;
the database is the persistent telemetry store rather than an in-memory
array being the only source of truth.

## Browser persistence and restoration

The application uses two browser-side storage mechanisms:

-   **DuckDB-Wasm / OPFS:** The database is stored at
    `opfs://fleet-console.db`.
-   **IndexedDB archive:** A database named `fleet-console-storage`
    stores telemetry packets in a packet store.

After a successful DuckDB commit, newly committed packets are also saved
to IndexedDB. On startup, the application loads archived packets and
merges packets missing from DuckDB. Both stores are capped to the newest
10,000 packets. The application also requests persistent browser
storage.

This design allows stored telemetry to be restored after a browser
restart when the same origin and browser profile are used and the
browser has retained the site's data. React's in-memory state is
recreated on reload; persisted telemetry is restored from browser
storage.

### Packet identity and deduplication

Each generated packet receives a UUID-based ID such as `pkt-<uuid>`. The
`packet_id` column is the primary key in `telemetry_packets`; vehicle ID
plus event timestamp is not treated as a unique packet identity.

Before inserting a batch, the simulator deduplicates repeated packet IDs
in the current batch and checks DuckDB for IDs already stored. Replayed
packets with the same ID are not inserted again and are not sent through
the new-packet commit callback. Restoration uses
`ON CONFLICT (packet_id) DO NOTHING`, and IndexedDB uses `packetId` as
its object-store key.

Consequently, replaying the same packet object does not create a second
stored packet. Two packets for the same vehicle and timestamp can still
be stored if they have different packet IDs.

## Simulator behavior

The simulator is intended to exercise the dashboard against imperfect
telemetry rather than only clean, regularly spaced readings. It
supports:

-   Partial packets that contain only some signals.
-   Occasional replays of the same packet.
-   Late-arriving packets whose event timestamp is approximately 60
    seconds earlier.
-   Missed reporting intervals for a fixed subset of vehicles.
-   A delayed in-memory backlog that can release up to 10 packets on
    later ticks, with a 50% chance on a tick.

The dashboard currently configures a fleet of 500 vehicles and a
simulator tick interval of 1,000 ms. Packet commits use chunks of 100,
and dashboard vehicle-state aggregation uses batches of 100. These
values are configured in code rather than exposed as UI settings.

The missed-reporting subset is deterministic (every 17th vehicle,
starting with the 17th), not a randomized connectivity model. The
backlog is held in memory and is lost on page refresh; it is not a
durable network queue or a complete disconnect/reconnect simulation.

## Vehicle state and status rules

The current overall status is derived from the latest merged SOC (state
of charge) and battery-temperature signals. The rules are:

  -----------------------------------------------------------------------
  Condition                           Status
  ----------------------------------- -----------------------------------
  Neither SOC nor battery temperature Unknown
  is a valid number                   

  SOC below 10%                       Critical

  Battery temperature above 45°C      Critical

  SOC from 10% up to, but not         Moderate
  including, 20%, when no critical    
  condition applies                   

  At least one valid signal, with no  Normal
  critical or moderate condition      
  -----------------------------------------------------------------------

If both SOC below 10% and battery temperature above 45°C apply, both
reasons are recorded. The displayed message prioritizes overheating.
Exactly 20% SOC is not moderate, and exactly 45°C is not overheating.

Signal values are merged independently. A partial packet updates only
the signals it contains; a missing signal in a packet does not erase the
last valid value already merged for that vehicle. Per-signal event
timestamps are tracked so that an older, late-arriving value does not
overwrite a newer value for the same signal.

The dashboard shows the latest event time and latest packet-received
time. These timestamps are not currently used to calculate a freshness
age.

## Current product scope

The current UI focuses on a straightforward table-based fleet view and a
separate vehicle detail page:

-   The dashboard shows current vehicle state and supports filtering by
    state.
-   The vehicle detail page provides vehicle metadata and telemetry
    packet logs.
-   The implementation prioritizes a continuously visible overview and
    drill-down into individual vehicle data.

The current implementation does not maintain a separate actionable alert
queue. Status and alert messages are recalculated from the latest merged
readings rather than managed as persistent alert records.

## Limitations

The following are known limitations of the current implementation:

-   **No freshness/stale detection:** The application does not calculate
    signal age, apply a configurable freshness threshold, or label
    individual signals as stale. Old last-known values can continue to
    determine status.
-   **No alert lifecycle:** Operators cannot acknowledge, dismiss,
    defer, or undo attention items. There is no persistent alert history
    or notification/escalation workflow.
-   **Simulator consistency:** Metrics are generated largely
    independently and may be logically inconsistent---for example,
    battery SOC may decrease while estimated range increases.
-   **Simplified connectivity model:** Missing reporting is assigned to
    a fixed set of vehicles. The delayed backlog is in memory and is
    lost on refresh; there is no full network reconnect simulation.
-   **Bounded retention:** DuckDB and IndexedDB retain only the newest
    10,000 packets. Older packets can be removed as new telemetry is
    retained.
-   **Browser storage dependency:** Stored data is scoped to the same
    origin and browser profile. Clearing site data, changing
    origin/profile, or browser storage eviction can make it unavailable.
    Persistent-storage requests do not guarantee that data can never be
    removed.
-   **Offline behavior is not a complete guarantee:** Telemetry is
    stored locally, but successful app startup and all browser
    capabilities while offline depend on the browser and how the app
    assets are served.
-   **Validation and negative cases:** Additional validation and
    negative-test coverage would be useful.
-   **UI scope:** The current layout is intentionally simple. More
    advanced charts, richer filters/search/sorting, and expanded
    vehicle-level analysis could be added.
-   **Compatibility/performance:** Browser-specific OPFS/DuckDB-Wasm
    behavior, quota handling, and performance at larger data volumes
    should be tested on target browsers and devices. Large-scale
    performance and compatibility are not claimed as comprehensively
    validated here.

## Potential next improvements

-   Add per-signal freshness thresholds and visible stale/unknown
    distinctions.
-   Introduce persistent alert records and acknowledge/dismiss/defer
    actions with undo or restoration.
-   Make simulator fleet size, packet batch size, and tick interval
    configurable through the UI.
-   Generate more realistic, correlated telemetry values and model
    explicit disconnect/reconnect cycles.
-   Add broader negative-case and browser-compatibility tests.
-   Add charts and richer vehicle-level history views.
-   Evaluate retention policy, storage quota failures, and performance
    with larger fleets and longer histories.

## AI tools and development process

AI tools used during development:

-   ChatGPT
-   Claude
-   GitHub Copilot in VS Code

AI assistance was used for understanding requirements, architecture and
implementation ideas, code generation, debugging, tests, and
documentation. The project was not produced exclusively by AI: code was
also written manually. Generated suggestions were reviewed selectively,
and substantial code was rejected or changed when it did not meet the
requirements. Verification was partial, so the implementation should not
be described as fully validated.

Switching between tools was challenging because each tool developed its
own understanding of the code and project context. The final
implementation reflects a mix of manually written code and selected
AI-assisted changes.

### Conversation evidence

-   Claude: https://claude.ai/share/61e05e05-f801-452a-b06b-f02e980f72e5
-   ChatGPT: https://chatgpt.com/s/t_6ad799f77f308191907620f1562e1444
-   GitHub Copilot: used in VS Code; no shareable transcript link is
    currently provided.

The available links are supplied as conversation evidence. No claim is
made that a Copilot or Gemini transcript is attached.

## Repository

Source code: https://github.com/mdsadique2/fleet-simulator-dashboard

## Notes for reviewers

-   The commands above describe the current development and test
    workflow.
-   Simulator values such as fleet size, tick interval, and batch size
    are currently code-configured rather than adjustable in the UI.
-   Freshness-based stale detection and operator alert actions are not
    implemented.
-   AI assistance was used, but verification was partial; limitations
    and unverified behavior are called out rather than assumed to be
    complete.
