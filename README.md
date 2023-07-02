# Shared services of [the Org](https://github.com/didalik/role-based-org/blob/main/README.md)

Hi there, I'm Дід Alik - the founder of the _Дід Alik & the Kids_ distributed organisation (**the Org**). This document introduces our shared services (**svc**) and presents some use cases. [The first implementation of the shared services](https://github.com/amissine/shex#shared-services) appeared in my Stellar Help Exchange (**HEX**) hobby project. Then I kept adding and using more services until I realized the services are the cornerstone of the Org.

## Using the services to join the Org

```
_o_  +-------+ +-----------+ +-------+
 A   | Admit | | Bootstrap | | Vault |
kid  +-------+ +-----------+ +-------+
 | apply |           |           |
 |------>|           |           |
 |       |           |           |
 | admit |           |           |
 |<------|           |           |
 |                   |           |
 | configure         |           |
 |------------------>|           |
 |                   | get repos |
 |                   |---------->|
 |         put repos |
 |<------------------|
```

To join the Org, a kid uses three services: _Admit_, _Bootstrap_, and _Vault_. Once upon a time, there was a kid (Дід Alik) who created these services. And then Дід Alik used them to join the Org. To create a service, Дід Alik used a git repo (a submodule, to be precise) called _genesis_. Of course, he had to create it first.

## The _genesis_ submodule
The _genesis_ submodule creates and maintains a distributed (shared) service, which is a superproject of the submodule. The basic idea is that a service **owner** adds a service to the service repository, then a service **agent** offers it to kids, and a service **user** binds with the agent to use the service's API (e.g., _admit.apply_, _bootstrap.configure_, _vault.getrepos_).

The submodule makes use of [Cloudflare Pub/Sub](https://developers.cloudflare.com/pub-sub/) API. It is presently being mocked by a CFW DO.

## Mapping [Cloudflare Pub/Sub concepts](https://developers.cloudflare.com/pub-sub/learning/how-pubsub-works/) to services

A _broker_ groups together a set of _authenticated_ agents and users of one or more services. In this sense it is mapped to a service repository. A _topic_ is mapped to a service. Therefore, a _namespace_ is mapped to a set of (sets of) service repositories. For example, 'the Org' would be a namespace for brokers 'Admit', 'Bootstrap', 'Vault'. Or, "All Our Projects" would be a namespace for brokers "Org", "svc", "HEX". If we follow this logic, we find that a _namespace_ can awlays be thought of as a _broker_ - in order to prevent this expansion, we need to see (define?) the difference between a broker and a namespace.

## TODOs

- June 14, 2023. Get rid of `stellar-sdk` dependency, 372.6kb => 25.2kb + 37.4kb sourcemap. Done June 25.

- June 25. Push the `registry` and `genesis` repos to the Vault, store the info in the `svc-registry` CFW DO. Remember the `rm -rf .git/modules/org` thing. Done July 2.
