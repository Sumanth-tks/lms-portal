const prisma = require('../config/db');

// ─── Threads ─────────────────────────────────────────

async function listThreads(req, res) {
  try {
    const { moduleId } = req.query;
    const where = moduleId ? { moduleId } : {};

    const threads = await prisma.discussionThread.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
        module: { select: { id: true, title: true, course: { select: { id: true, title: true } } } },
        _count: { select: { replies: true, upvotes: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    // Attach whether current user upvoted each thread
    const threadIds = threads.map((t) => t.id);
    const userUpvotes = await prisma.threadUpvote.findMany({
      where: { threadId: { in: threadIds }, userId: req.user.id },
      select: { threadId: true },
    });
    const upvotedSet = new Set(userUpvotes.map((u) => u.threadId));

    const data = threads.map((t) => ({
      ...t,
      upvoted: upvotedSet.has(t.id),
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getThread(req, res) {
  try {
    const thread = await prisma.discussionThread.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
        module: { select: { id: true, title: true, course: { select: { id: true, title: true } } } },
        _count: { select: { replies: true, upvotes: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, role: true, avatarUrl: true } },
            _count: { select: { upvotes: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });

    // Attach upvote status for thread and each reply
    const [threadUpvote, replyUpvotes] = await Promise.all([
      prisma.threadUpvote.findUnique({
        where: { threadId_userId: { threadId: thread.id, userId: req.user.id } },
      }),
      prisma.replyUpvote.findMany({
        where: { replyId: { in: thread.replies.map((r) => r.id) }, userId: req.user.id },
        select: { replyId: true },
      }),
    ]);
    const upvotedReplySet = new Set(replyUpvotes.map((u) => u.replyId));

    const data = {
      ...thread,
      upvoted: !!threadUpvote,
      replies: thread.replies.map((r) => ({
        ...r,
        upvoted: upvotedReplySet.has(r.id),
      })),
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function createThread(req, res) {
  try {
    const thread = await prisma.discussionThread.create({
      data: {
        moduleId: req.body.moduleId,
        authorId: req.user.id,
        title: req.body.title,
        body: req.body.body,
      },
      include: {
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
        module: { select: { id: true, title: true } },
        _count: { select: { replies: true, upvotes: true } },
      },
    });
    res.status(201).json({ success: true, data: { ...thread, upvoted: false } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteThread(req, res) {
  try {
    const thread = await prisma.discussionThread.findUnique({ where: { id: req.params.id } });
    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });

    // Only author or ADMIN/MENTOR can delete
    if (thread.authorId !== req.user.id && req.user.role === 'INTERN') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await prisma.discussionThread.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── Thread moderation (ADMIN/MENTOR) ────────────────

async function togglePin(req, res) {
  try {
    const thread = await prisma.discussionThread.findUnique({ where: { id: req.params.id } });
    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });

    const updated = await prisma.discussionThread.update({
      where: { id: req.params.id },
      data: { isPinned: !thread.isPinned },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function toggleResolve(req, res) {
  try {
    const thread = await prisma.discussionThread.findUnique({ where: { id: req.params.id } });
    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });

    const updated = await prisma.discussionThread.update({
      where: { id: req.params.id },
      data: { isResolved: !thread.isResolved },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── Upvotes ─────────────────────────────────────────

async function toggleThreadUpvote(req, res) {
  try {
    const existing = await prisma.threadUpvote.findUnique({
      where: { threadId_userId: { threadId: req.params.id, userId: req.user.id } },
    });

    if (existing) {
      await prisma.threadUpvote.delete({ where: { id: existing.id } });
      res.json({ success: true, data: { upvoted: false } });
    } else {
      await prisma.threadUpvote.create({
        data: { threadId: req.params.id, userId: req.user.id },
      });
      res.json({ success: true, data: { upvoted: true } });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function toggleReplyUpvote(req, res) {
  try {
    const existing = await prisma.replyUpvote.findUnique({
      where: { replyId_userId: { replyId: req.params.replyId, userId: req.user.id } },
    });

    if (existing) {
      await prisma.replyUpvote.delete({ where: { id: existing.id } });
      res.json({ success: true, data: { upvoted: false } });
    } else {
      await prisma.replyUpvote.create({
        data: { replyId: req.params.replyId, userId: req.user.id },
      });
      res.json({ success: true, data: { upvoted: true } });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── Replies ─────────────────────────────────────────

async function createReply(req, res) {
  try {
    const thread = await prisma.discussionThread.findUnique({ where: { id: req.params.id } });
    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });

    const reply = await prisma.discussionReply.create({
      data: {
        threadId: req.params.id,
        authorId: req.user.id,
        body: req.body.body,
      },
      include: {
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
        _count: { select: { upvotes: true } },
      },
    });
    res.status(201).json({ success: true, data: { ...reply, upvoted: false } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteReply(req, res) {
  try {
    const reply = await prisma.discussionReply.findUnique({ where: { id: req.params.replyId } });
    if (!reply) return res.status(404).json({ success: false, error: 'Reply not found' });

    if (reply.authorId !== req.user.id && req.user.role === 'INTERN') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await prisma.discussionReply.delete({ where: { id: req.params.replyId } });
    res.json({ success: true, data: { id: req.params.replyId } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  listThreads,
  getThread,
  createThread,
  deleteThread,
  togglePin,
  toggleResolve,
  toggleThreadUpvote,
  toggleReplyUpvote,
  createReply,
  deleteReply,
};
