module sui_nexus::nexus {
    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;

    /// A node in the knowledge graph.
    public struct KnowledgeNode has key, store {
        id: UID,
        name: String,
        description: String,
        version: u64,
        trust_score: u64,
        color: String,
        owner: address,
        walrus_blob_id: String,
    }

    /// An edge between two nodes in the knowledge graph.
    public struct RelationshipEdge has key, store {
        id: UID,
        source: address, // To make this simple, source is the ID of the node as address
        target: address,
        relationship_type: String,
        weight: u64,
        color: String,
        created_by: address,
    }

    /// Event emitted when a node is created
    public struct NodeCreated has copy, drop {
        node_id: address,
        name: String,
        owner: address,
        walrus_blob_id: String,
    }

    /// Event emitted when an edge is created
    public struct EdgeCreated has copy, drop {
        edge_id: address,
        source: address,
        target: address,
        relationship_type: String,
    }

    /// Event emitted when a node is voted on
    public struct NodeVoted has copy, drop {
        node_id: address,
        new_trust_score: u64,
        voter: address,
    }

    /// Creates a new KnowledgeNode
    public entry fun create_node(
        name: vector<u8>,
        description: vector<u8>,
        color: vector<u8>,
        walrus_blob_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        let node_id = object::new(ctx);
        let node_addr = object::uid_to_address(&node_id);
        let sender = tx_context::sender(ctx);

        let node = KnowledgeNode {
            id: node_id,
            name: string::utf8(name),
            description: string::utf8(description),
            version: 1,
            trust_score: 50,
            color: string::utf8(color),
            owner: sender,
            walrus_blob_id: string::utf8(walrus_blob_id),
        };

        event::emit(NodeCreated {
            node_id: node_addr,
            name: node.name,
            owner: sender,
            walrus_blob_id: node.walrus_blob_id,
        });

        // Make the node a shared object so anyone can interact/vote on it
        transfer::public_share_object(node);
    }

    /// Creates a new RelationshipEdge
    public entry fun create_edge(
        source: address,
        target: address,
        relationship_type: vector<u8>,
        weight: u64,
        color: vector<u8>,
        ctx: &mut TxContext
    ) {
        let edge_id = object::new(ctx);
        let edge_addr = object::uid_to_address(&edge_id);
        let sender = tx_context::sender(ctx);

        let edge = RelationshipEdge {
            id: edge_id,
            source,
            target,
            relationship_type: string::utf8(relationship_type),
            weight,
            color: string::utf8(color),
            created_by: sender,
        };

        event::emit(EdgeCreated {
            edge_id: edge_addr,
            source,
            target,
            relationship_type: edge.relationship_type,
        });

        transfer::public_share_object(edge);
    }

    /// Upvotes a KnowledgeNode
    public entry fun upvote_node(
        node: &mut KnowledgeNode,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        if (node.trust_score < 100) {
            node.trust_score = node.trust_score + 5;
            if (node.trust_score > 100) {
                node.trust_score = 100;
            };
        };

        event::emit(NodeVoted {
            node_id: object::uid_to_address(&node.id),
            new_trust_score: node.trust_score,
            voter: sender,
        });
    }

    /// Downvotes a KnowledgeNode
    public entry fun downvote_node(
        node: &mut KnowledgeNode,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        if (node.trust_score >= 5) {
            node.trust_score = node.trust_score - 5;
        } else {
            node.trust_score = 0;
        };

        event::emit(NodeVoted {
            node_id: object::uid_to_address(&node.id),
            new_trust_score: node.trust_score,
            voter: sender,
        });
    }

    /// Update node description
    public entry fun update_node(
        node: &mut KnowledgeNode,
        new_desc: vector<u8>,
        ctx: &mut TxContext
    ) {
        node.description = string::utf8(new_desc);
        node.version = node.version + 1;
        node.owner = tx_context::sender(ctx);
    }
}
