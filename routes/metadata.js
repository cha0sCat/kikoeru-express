const path = require('path');
const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { getTrackList, toTree } = require('../filesystem/utils');
const { config } = require('../config');
const normalize = require('./utils/normalize')

const PAGE_SIZE = config.pageSize || 12;

// GET work cover image
router.get('/cover/:id', (req, res, next) => {
  const rjcode = (`000000${req.params.id}`).slice(-6);
  const type = req.query.type || 'main'; // 'main', 'sam', '240x240', '360x360'
  res.sendFile(path.join(config.coverFolderDir, `RJ${rjcode}_img_${type}.jpg`), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, '../static/no-image.jpg'), (err2) => {
        if (err2) {
          next(err2);
        }
      });
    }
  });
});

// GET work metadata
router.get('/work/:id', (req, res, next) => {
  let username = 'admin';
  if (config.auth) {
    username = req.user.name;
  }
  db.getWorkMetadata(req.params.id, username)
    .then(work => {
      // work is an Array of length 1
      // db.getWorkMetadata(id, username) throws if nothing is found
      normalize(work);
      res.send(work[0]);
    })
    .catch(err => next(err));
});

// GET track list in work folder
router.get('/tracks/:id', (req, res, next) => {
  db.knex('t_work')
    .select('title', 'root_folder', 'dir')
    .where('id', '=', req.params.id)
    .first()
    .then((work) => {
      const rootFolder = config.rootFolders.find(rootFolder => rootFolder.name === work.root_folder);
      if (rootFolder) {
        getTrackList(req.params.id, path.join(rootFolder.path, work.dir))
          .then(tracks => res.send(toTree(tracks, work.title, work.dir, rootFolder)))
          .catch(() => res.status(500).send({error: '获取文件列表失败，请检查文件是否存在或重新扫描清理'}));
      } else {
        res.status(500).send({error: `找不到文件夹: "${work.root_folder}"，请尝试重启服务器或重新扫描.`});
      }
    })
    .catch(err => next(err));
});

// GET list of work ids
// eslint-disable-next-line no-unused-vars
router.get('/works', async (req, res, next) => {
  const currentPage = parseInt(req.query.page) || 1;
  // 通过 "音声id, 贩卖日, 评价, 用户评价, 售出数, 评论数量, 价格, 平均评价, 全年龄新作， 评价" 排序
  // ['id', 'release', 'rating', 'dl_count', 'review_count', 'price', 'rate_average_2dp, nsfw']
  const order = req.query.order || 'release';
  const sort = req.query.sort || 'desc';
  const offset = (currentPage - 1) * PAGE_SIZE;
  const username = config.auth ? req.user.name : 'admin';
  const shuffleSeed = req.query.seed ? req.query.seed : 7;
  
  try {
    const query = () => db.getWorksBy({username: username});
    const totalCount = await query().count('id as count');

    let works = null;

    if (order === 'random') {
      // 随机排序+分页 hack
      works = await query().offset(offset).limit(PAGE_SIZE).orderBy(db.knex.raw('id % ?', shuffleSeed));
    } else if (order === 'betterRandom') {
      // 随心听专用，不支持分页
      works = await query().limit(1).orderBy(db.knex.raw('random()'));
    } else {
      works = await query().offset(offset).limit(PAGE_SIZE).orderBy(order, sort)
      .orderBy([{ column: 'release', order: 'desc'}, { column: 'id', order: 'desc' }])
    }

    works = normalize(works);
    
    res.send({
      works,
      pagination: {
        currentPage,
        pageSize: PAGE_SIZE,
        totalCount: totalCount[0]['count']
      }
    });
  } catch(err) {
    res.status(500).send({error: '服务器错误'});
    console.error(err)
    // next(err);
  }
});

// GET name of a circle/tag/VA
router.get('/:field(circle|tag|va)s/:id', (req, res, next) => {
  // In case regex matching goes wrong
  const validFields = ['circle', 'tag', 'va'];
  if (!validFields.includes(req.params.field)) {
    const err = new Error(`无效的查询域：field: ${req.originalUrl}`)
    return next(err)
  }

  return db.getMetadata({field: req.params.field, id: req.params.id})
    .then(item => {
      if (item) {
        res.send(item) 
      } else {
        const errorMessage= {
          'circle': `社团${req.params.id}不存在`,
          'tag': `标签${req.params.id}不存在`,
          'va': `声优${req.params.id}不存在`
        }
        res.status(404).send({error: errorMessage[req.params.field]})
      }
    })
    .catch(err => next(err));
});

// eslint-disable-next-line no-unused-vars
router.get('/search/:keyword?', async (req, res, next) => {
  const keyword = req.params.keyword ? req.params.keyword.trim() : '';
  const currentPage = parseInt(req.query.page) || 1;
  // 通过 "音声id, 贩卖日, 用户评价， 售出数, 评论数量, 价格, 平均评价, 全年龄新作" 排序
  // ['id', 'release', 'rating', 'dl_count', 'review_count', 'price', 'rate_average_2dp', 'nsfw']
  const order = req.query.order || 'release';
  const sort = req.query.sort || 'desc';
  const offset = (currentPage - 1) * PAGE_SIZE;
  const username = config.auth ? req.user.name : 'admin';
  const shuffleSeed = req.query.seed ? req.query.seed : 7;
  
  try {
    const query = () => db.getWorksByKeyWord({keyword: keyword, username: username});
    const totalCount = await query().count('id as count');

    let works = null;

    if (order === 'random') {
      works = await query().offset(offset).limit(PAGE_SIZE).orderBy(db.knex.raw('id % ?', shuffleSeed));
    } else {
      works = await query().offset(offset).limit(PAGE_SIZE).orderBy(order, sort)
        .orderBy([{ column: 'release', order: 'desc'}, { column: 'id', order: 'desc' }])
    }

    works = normalize(works);

    res.send({
      works,
      pagination: {
        currentPage,
        pageSize: PAGE_SIZE,
        totalCount: totalCount[0]['count']
      }
    });
  } catch(err) {
    res.status(500).send({error: '查询过程中出错'});
    console.error(err);
    // next(err);
  }
});

// GET list of work ids, restricted by circle/tag/VA
// eslint-disable-next-line no-unused-vars
router.get('/:field(circle|tag|va)s/:id/works', async (req, res, next) => {
  // In case regex matching goes wrong
  const validFields = ['circle', 'tag', 'va'];
  if (!validFields.includes(req.params.field)) {
    const err = new Error(`无效的查询域：${req.originalUrl}`)
    return next(err)
  }

  const currentPage = parseInt(req.query.page) || 1;
  // 通过 "音声id, 贩卖日, 用户评价, 售出数, 评论数量, 价格, 平均评价, 全年龄新作" 排序
  // ['id', 'release', 'rating', 'dl_count', 'review_count', 'price', 'rate_average_2dp, 'nsfw']
  const order = req.query.order || 'release';
  const sort = req.query.sort || 'desc'; // ['desc', 'asc]
  const offset = (currentPage - 1) * PAGE_SIZE;
  const username = config.auth ? req.user.name : 'admin';
  const shuffleSeed = req.query.seed ? req.query.seed : 7;

  try {
    const query = () => db.getWorksBy({id: req.params.id, field: req.params.field, username: username});
    const totalCount = await query().count('id as count');

    let works = null;

    if (order === 'random') {
      works = await query().offset(offset).limit(PAGE_SIZE).orderBy(db.knex.raw('id % ?', shuffleSeed));
    } else {
      works = await query().offset(offset).limit(PAGE_SIZE).orderBy(order, sort)
      .orderBy([{ column: 'release', order: 'desc'}, { column: 'id', order: 'desc' }])
    }

    works = normalize(works);

    res.send({
      works,
      pagination: {
        currentPage,
        pageSize: PAGE_SIZE,
        totalCount: totalCount[0]['count']
      }
    });
  } catch(err) {
    res.status(500).send({error: '查询过程中出错'});
    console.error(err);
    // next(err);
  }
});

// GET list of circles/tags/VAs
router.get('/:field(circle|tag|va)s/', (req, res, next) => {
  // In case regex matching goes wrong
  const validFields = ['circle', 'tag', 'va'];
  if (!validFields.includes(req.params.field)) {
    const err = new Error(`无效的查询域：${req.originalUrl}`)
    return next(err)
  }

  const field = req.params.field;
  db.getLabels(field)
    .orderBy(`name`, 'asc')
    .then(list => res.send(list))
    .catch(err => next(err));
});

module.exports = router;
