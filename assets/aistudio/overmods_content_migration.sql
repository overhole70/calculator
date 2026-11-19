-- Over Mods D1 Migration File: overmods-content
-- Generated on: 2026-11-08T13:46:38.609Z

-- ==========================================
-- TABLE: mods (22 records)
-- ==========================================
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        '8A4xmYj6B4AHBDZ4zuDO', 'RK20OD', NULL, 'RenderDistance fps++', 'RenderDistance', 'public',
        '9uLKUWpImuSWZj5PbXuSTmt5rjd2', 'Resource Pack', 'أدوات', '1.26.3', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1791284284/wzb8z6hylhyhprmutv7u.jpg',
        '[]', 'https://www.mediafire.com/file/mupqji5ne9k11rp/Render+', '122.91MB', '{"downloads":7,"likes":2,"dislikes":0,"averageRating":0,"ratingCount":0,"views":14,"userRatings":{},"uniqueViews":14}', NULL,
        '[]', '["9uLKUWpImuSWZj5PbXuSTmt5rjd2","gMtBHljM6ZZUD3QB9hcy8FdYCU63"]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"8A4xmYj6B4AHBDZ4zuDO","price":0,"mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1791284284/wzb8z6hylhyhprmutv7u.jpg","likedBy":["9uLKUWpImuSWZj5PbXuSTmt5rjd2","gMtBHljM6ZZUD3QB9hcy8FdYCU63"],"fakeStats":null,"requirements":[],"fileSize":"122.91MB","publisherName":"azqs2","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1791283445/zrbfbvgto6ryghqrzs4r.png","stats":{"downloads":7,"likes":2,"dislikes":0,"averageRating":0,"ratingCount":0,"views":14,"userRatings":{},"uniqueViews":14},"createdAt":"2026-10-06T10:58:04.749644Z","youtubeUrl":"","shareCode":"RK20OD","visibilityLevel":"public","title":"RenderDistance fps++","platform":"Bedrock","description":"RenderDistance","port":null,"dislikedBy":[],"comments":[],"downloadUrl":"https://www.mediafire.com/file/mupqji5ne9k11rp/Render+","verified":false,"publisherId":"9uLKUWpImuSWZj5PbXuSTmt5rjd2","modLoader":null,"minecraftVersion":"1.26.3","ip":null,"modCode":"","tags":[],"category":"أدوات","additionalImages":[],"supportedVersions":[],"type":"Resource Pack"}', '2026-10-06T10:58:04.749644Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'HmYuxGVRNQ5FyQGUHpzb', 'MHEB6Y', NULL, 'مود تجريبي', 'مود تدريبي', 'public',
        'X9TOYhUwzuOVZZcdaTwsNisFDgN2', 'Mod', 'مغامرة', '1.26.10', 'https://worker.overmods.site/imagesmods/HmYuxGVRNQ5FyQGUHpzb.webp',
        '[]', 'https://www.mediafire.com/file/cmcoun3sr2j4as4/GraveStone_%25281.21.50%252B%2529_V2.0.1.mcaddon/file', '10MB', '{"averageRating":0,"downloads":1,"totalRatingScore":0,"likes":0,"monetizedViews":0,"uniqueViews":3,"userRatings":{},"ratingCount":0,"views":3,"dislikes":0}', NULL,
        '[]', '[]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"HmYuxGVRNQ5FyQGUHpzb","likedBy":[],"modLoader":null,"monetizationEnabled":false,"publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1780532467/X9TOYhUwzuOVZZcdaTwsNisFDgN2.jpg","platform":"Bedrock","visibilityLevel":"public","description":"مود تدريبي","fileSize":"10MB","isVerified":true,"port":null,"publisherName":"kol","category":"مغامرة","minecraftVersion":"1.26.10","fakeStats":null,"price":0,"requirements":[],"mainImage":"https://worker.overmods.site/imagesmods/HmYuxGVRNQ5FyQGUHpzb.webp","additionalImages":[],"supportedVersions":[],"title":"مود تجريبي","youtubeUrl":"","stats":{"averageRating":0,"downloads":1,"totalRatingScore":0,"likes":0,"monetizedViews":0,"uniqueViews":3,"userRatings":{},"ratingCount":0,"views":3,"dislikes":0},"downloadUrl":"https://www.mediafire.com/file/cmcoun3sr2j4as4/GraveStone_%25281.21.50%252B%2529_V2.0.1.mcaddon/file","customAdRate":null,"type":"Mod","ip":null,"publisherId":"X9TOYhUwzuOVZZcdaTwsNisFDgN2","dislikedBy":[],"modCode":"","comments":[],"shareCode":"MHEB6Y","tags":[],"createdAt":"2026-11-01T15:02:16.849Z"}', '2026-11-01T15:02:16.849Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'J1vmK9ryFYxi6aSYg8c0', 'M4EIMR', NULL, 'dimond portal', 'يمكنك بناء بوابة الدياموند و جمعة الكمية التي تريدها', 'public',
        'M3rLhLyu4AhHoeFhMK6dvEqXtl53', 'world', 'عوالم', '1.21.130', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1788521394/x3hmzbkanfrevgsqcz78.jpg',
        '[]', 'https://www.mediafire.com/file/ethd3fx8h4bjb6n/diamond-dimension.mcworld.zip/file', '5MB', '{"dislikes":0,"ratingCount":0,"uniqueViews":20,"likes":2,"userRatings":{},"averageRating":0,"downloads":8,"commentsCount":1,"views":20}', NULL,
        '[{"createdAt":"2026-09-05T15:06:01.455288Z","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1777023659/kS9FtTVJ0GfiHvHqQze9TREhWIJ3.jpg","id":"c_1788620761455","text":"عالم خرافي 👍","userId":"kS9FtTVJ0GfiHvHqQze9TREhWIJ3","username":"holp"}]', '["kS9FtTVJ0GfiHvHqQze9TREhWIJ3","OjX2YkfmJJUQZHQ01J30CrJWPjE3"]', '[]', '{}', 'https://www.youtube.com/channel/UCNeD..', 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"J1vmK9ryFYxi6aSYg8c0","minecraftVersion":"1.21.130","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1788521394/x3hmzbkanfrevgsqcz78.jpg","tags":[],"category":"عوالم","publisherName":"ibragg013","type":"world","additionalImages":[],"fakeStats":null,"modCode":"","dislikedBy":[],"requirements":[],"description":"يمكنك بناء بوابة الدياموند و جمعة الكمية التي تريدها","shareCode":"M4EIMR","createdAt":"2026-09-04T11:29:54.263850Z","verified":false,"comments":[{"createdAt":"2026-09-05T15:06:01.455288Z","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1777023659/kS9FtTVJ0GfiHvHqQze9TREhWIJ3.jpg","id":"c_1788620761455","text":"عالم خرافي 👍","userId":"kS9FtTVJ0GfiHvHqQze9TREhWIJ3","username":"holp"}],"youtubeUrl":"https://www.youtube.com/channel/UCNeD..","publisherId":"M3rLhLyu4AhHoeFhMK6dvEqXtl53","supportedVersions":[],"platform":"Bedrock","stats":{"dislikes":0,"ratingCount":0,"uniqueViews":20,"likes":2,"userRatings":{},"averageRating":0,"downloads":8,"commentsCount":1,"views":20},"modLoader":null,"port":null,"downloadUrl":"https://www.mediafire.com/file/ethd3fx8h4bjb6n/diamond-dimension.mcworld.zip/file","title":"dimond portal","likedBy":["kS9FtTVJ0GfiHvHqQze9TREhWIJ3","OjX2YkfmJJUQZHQ01J30CrJWPjE3"],"fileSize":"5MB","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1788518788/M3rLhLyu4AhHoeFhMK6dvEqXtl53.jpg","visibilityLevel":"public","price":0,"ip":null}', '2026-09-04T11:29:54.263850Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'Vby93aXilQhX9GTdFfi8', 'RIZ6QP', NULL, 'FPS Optimizer', 'هذا الريسورس باك يقوم بتخفيف الاق عن طريق تقليل التأثيرات والبكصلات في اللعبة', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Resource Pack', 'بسيط', '1.26.40', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1793213871/rvowfrbbg8jepkwugald.png',
        '[]', 'https://www.mediafire.com/file/5otk2wm7v4x7bt2/FPS+Optimizer+v2.7.0.mcpack/file', '1.78MB', '{"averageRating":0,"likes":0,"uniqueViews":62,"views":62,"userRatings":{},"dislikes":0,"ratingCount":0,"downloads":20}', NULL,
        '[]', '[]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"Vby93aXilQhX9GTdFfi8","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1787774263/fvtfae6uysn2jgvyexjg.png","comments":[],"modCode":"","fakeStats":null,"dislikedBy":[],"verified":false,"visibilityLevel":"public","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","supportedVersions":[],"title":"FPS Optimizer","downloadUrl":"https://www.mediafire.com/file/5otk2wm7v4x7bt2/FPS+Optimizer+v2.7.0.mcpack/file","youtubeUrl":"","stats":{"averageRating":0,"likes":0,"uniqueViews":62,"views":62,"userRatings":{},"dislikes":0,"ratingCount":0,"downloads":20},"mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1793213871/rvowfrbbg8jepkwugald.png","port":null,"createdAt":"2026-10-28T18:57:50.841912Z","shareCode":"RIZ6QP","category":"بسيط","price":0,"publisherName":"Over Hole - Mikey","modLoader":null,"fileSize":"1.78MB","requirements":[],"description":"هذا الريسورس باك يقوم بتخفيف الاق عن طريق تقليل التأثيرات والبكصلات في اللعبة","ip":null,"platform":"Bedrock","minecraftVersion":"1.26.40","type":"Resource Pack","tags":[],"likedBy":[],"additionalImages":[]}', '2026-10-28T18:57:50.841912Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'gaappling-hoor_1784914455102', 'MJALKS', NULL, 'Gaappling Hoor', 'استكشف عالم ماين كرافت بطريقة جديدة مع مود جرابلينغ هوك! تنقل بسرعة، وصل إلى الأماكن المرتفعة، واستمتع بحركة سلسة وممتعة أثناء مغامراتك.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'أدوات', '1.26.31+', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1784914454/xeisnxwndgkygvyqtbxk.png',
        '[]', 'https://www.mediafire.com/file/fvpk579dckfwmw3/GrapplingHook%255BOver_Hole%255D.mcaddon/file', '0.5MB', '{"monetizedViews":53,"averageRating":3.5,"views":65,"totalRatingScore":7,"downloads":9,"dislikes":0,"ratingCount":2,"likes":5,"uniqueViews":65,"userRatings":{"WnIJG2bYLMYLbnM2vb5pNZar4XB3":3,"gMtBHljM6ZZUD3QB9hcy8FdYCU63":4}}', NULL,
        '[]', '["WnIJG2bYLMYLbnM2vb5pNZar4XB3","6AcjQABuI8Ufh1qIQRhUPthy6li1","YxyFcpjVrOQ8jw7Vw2aR1ZviqZo2","kS9FtTVJ0GfiHvHqQze9TREhWIJ3"]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 1,
        0, NULL, 1784914455101,
        NULL, '{"id":"gaappling-hoor_1784914455102","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","category":"أدوات","monetizationEnabled":true,"type":"Mod","price":0,"visibilityLevel":"public","downloadUrl":"https://www.mediafire.com/file/fvpk579dckfwmw3/GrapplingHook%255BOver_Hole%255D.mcaddon/file","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1784914454/xeisnxwndgkygvyqtbxk.png","platform":"Bedrock","likedBy":["WnIJG2bYLMYLbnM2vb5pNZar4XB3","6AcjQABuI8Ufh1qIQRhUPthy6li1","YxyFcpjVrOQ8jw7Vw2aR1ZviqZo2","kS9FtTVJ0GfiHvHqQze9TREhWIJ3"],"minecraftVersion":"1.26.31+","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","title":"Gaappling Hoor","isVerified":true,"youtubeUrl":"","monetizationActivatedAt":1784914455101,"publisherName":"Over Hole - Mikey","stats":{"monetizedViews":53,"averageRating":3.5,"views":65,"totalRatingScore":7,"downloads":9,"dislikes":0,"ratingCount":2,"likes":5,"uniqueViews":65,"userRatings":{"WnIJG2bYLMYLbnM2vb5pNZar4XB3":3,"gMtBHljM6ZZUD3QB9hcy8FdYCU63":4}},"description":"استكشف عالم ماين كرافت بطريقة جديدة مع مود جرابلينغ هوك! تنقل بسرعة، وصل إلى الأماكن المرتفعة، واستمتع بحركة سلسة وممتعة أثناء مغامراتك.","fileSize":"0.5MB","createdAt":"2026-07-24T17:33:51.747Z","shareCode":"MJALKS","dislikedBy":[]}', '2026-07-24T17:33:51.747Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'i3sAfIi0jv28ipcy31l0', 'MQ6KP7', NULL, 'مود السيارات (Kei)', 'مود يضيف سيارات kei تضيف متعة في التنقل في عالم ماين كرافت', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'تقني', '1.26.40', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1793225222/rth0ttpmiey9nh1htkxn.png',
        '[]', 'https://www.mediafire.com/file/4arhntaivnpglgo/Kei+Car+Pack.mcaddon/file', '0.5MB', '{"ratingCount":0,"averageRating":0,"views":10,"dislikes":0,"downloads":3,"likes":1,"uniqueViews":7,"userRatings":{}}', NULL,
        '[]', '["X9TOYhUwzuOVZZcdaTwsNisFDgN2"]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"i3sAfIi0jv28ipcy31l0","shareCode":"MQ6KP7","verified":false,"createdAt":"2026-10-28T22:07:02.368901Z","stats":{"ratingCount":0,"averageRating":0,"views":10,"dislikes":0,"downloads":3,"likes":1,"uniqueViews":7,"userRatings":{}},"downloadUrl":"https://www.mediafire.com/file/4arhntaivnpglgo/Kei+Car+Pack.mcaddon/file","likedBy":["X9TOYhUwzuOVZZcdaTwsNisFDgN2"],"title":"مود السيارات (Kei)","comments":[],"publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","price":0,"tags":[],"publisherName":"Over Hole - Mikey","supportedVersions":[],"mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1793225222/rth0ttpmiey9nh1htkxn.png","fakeStats":null,"type":"Mod","requirements":[],"category":"تقني","youtubeUrl":"","visibilityLevel":"public","ip":null,"publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1787774263/fvtfae6uysn2jgvyexjg.png","fileSize":"0.5MB","dislikedBy":[],"platform":"Bedrock","additionalImages":[],"port":null,"modCode":"","description":"مود يضيف سيارات kei تضيف متعة في التنقل في عالم ماين كرافت","modLoader":null,"minecraftVersion":"1.26.40"}', '2026-10-28T22:07:02.368901Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'oMBwPncBTi7zzl8djaNx', 'MVPSIV', NULL, 'animated itachi', 'خلفية ايتاشي في ماين كرافت', 'public',
        '96pPvaqNzxcu7KaPM9fhM8XvgKJ3', 'Mod', 'أخرى', '', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1793545581/cpkj757tc3ugdz774kci.png',
        '[]', 'https://www.mediafire.com/file/l13odm5ighnf3xj/Animated+Itachi+Death+UI.mcpack/file', '0 MB', '{"uniqueViews":2,"userRatings":{},"dislikes":0,"views":2,"downloads":2,"likes":0,"ratingCount":0,"averageRating":0}', NULL,
        '[]', '[]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"oMBwPncBTi7zzl8djaNx","dislikedBy":[],"shareCode":"MVPSIV","publisherId":"96pPvaqNzxcu7KaPM9fhM8XvgKJ3","tags":[],"createdAt":"2026-11-01T14:05:10.835Z","stats":{"uniqueViews":2,"userRatings":{},"dislikes":0,"views":2,"downloads":2,"likes":0,"ratingCount":0,"averageRating":0},"platform":"Bedrock","downloadUrl":"https://www.mediafire.com/file/l13odm5ighnf3xj/Animated+Itachi+Death+UI.mcpack/file","type":"Mod","title":"animated itachi","youtubeUrl":"","modCode":"","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1793545581/cpkj757tc3ugdz774kci.png","fileSize":"","requirements":[],"minecraftVersion":"","price":0,"additionalImages":[],"fakeStats":null,"publisherName":"badre","category":"","visibilityLevel":"public","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1793543041/tfc8uqiqcrkmz7darmlc.jpg","ip":null,"port":null,"likedBy":[],"description":"خلفية ايتاشي في ماين كرافت","supportedVersions":[],"verified":false,"modLoader":null,"comments":[]}', '2026-11-01T14:05:10.835Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'ريسورس-باك-اظهار-الفريمات-(fps)_1780357502519', 'RSN6XP', NULL, 'ريسورس باك اظهار الفريمات (FPS)', 'ريسورس باك بسيط يضيف عداد FPS إلى شاشة اللعب لعرض عدد الإطارات في الثانية بشكل مباشر. يساعدك على مراقبة أداء اللعبة ومعرفة مدى سلاسة اللعب أثناء الاستكشاف أو القتال، بتصميم واضح وخفيف لا يؤثر على التجربة.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Resource Pack', 'تحسين الأداء', '26.10', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1780357503/jxxh1p8mxkbizcl1zvzl.png',
        '[]', 'https://www.mediafire.com/file/u17p3fxws0dcrjq/%25D8%25B1%25D9%258A%25D8%25B3%25D9%2588%25D8%25B1%25D8%25B3_%25D8%25A8%25D8%25A7%25D9%2583_%25D8%25A7%25D8%25B8%25D9%2587%25D8%25A7%25D8%25B1_%25D8%25A7%25D9%2584%25D9%2581%25D8%25B1%25D9%258A%25D9%2585%25D8%25A7%25D8%25AA_FPS_%255BOver_Hole%255D.mcpack/file', '0.41MB', '{"likes":23,"totalRatingScore":0,"commentsCount":1,"downloads":27,"dislikes":5,"ratingCount":0,"averageRating":0,"monetizedViews":251,"uniqueViews":327,"views":327}', NULL,
        '[{"createdAt":"2026-10-06T10:59:56.843350Z","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1791283445/zrbfbvgto6ryghqrzs4r.png","id":"c_1791284396842","text":"سلام عليكم نا جين من يوتيوب في قانتك  استمر","userId":"9uLKUWpImuSWZj5PbXuSTmt5rjd2","username":"azqs2"}]', '["gMtBHljM6ZZUD3QB9hcy8FdYCU63","WnIJG2bYLMYLbnM2vb5pNZar4XB3"]', '[]', '{}', 'https://youtu.be/GHGp6wVySms', 0,
        'Bedrock', NULL, 0, '[]', 1,
        0, NULL, NULL,
        NULL, '{"id":"ريسورس-باك-اظهار-الفريمات-(fps)_1780357502519","category":"تحسين الأداء","description":"ريسورس باك بسيط يضيف عداد FPS إلى شاشة اللعب لعرض عدد الإطارات في الثانية بشكل مباشر. يساعدك على مراقبة أداء اللعبة ومعرفة مدى سلاسة اللعب أثناء الاستكشاف أو القتال، بتصميم واضح وخفيف لا يؤثر على التجربة.","monetizationEnabled":true,"createdAt":"2026-06-01T23:45:00.671Z","shareCode":"RSN6XP","price":0,"minecraftVersion":"26.10","platform":"Bedrock","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1780357503/jxxh1p8mxkbizcl1zvzl.png","visibilityLevel":"public","publisherName":"Over Hole - Mikey","dislikedBy":[],"publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","fileSize":"0.41MB","comments":[{"createdAt":"2026-10-06T10:59:56.843350Z","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1791283445/zrbfbvgto6ryghqrzs4r.png","id":"c_1791284396842","text":"سلام عليكم نا جين من يوتيوب في قانتك  استمر","userId":"9uLKUWpImuSWZj5PbXuSTmt5rjd2","username":"azqs2"}],"likedBy":["gMtBHljM6ZZUD3QB9hcy8FdYCU63","WnIJG2bYLMYLbnM2vb5pNZar4XB3"],"stats":{"likes":23,"totalRatingScore":0,"commentsCount":1,"downloads":27,"dislikes":5,"ratingCount":0,"averageRating":0,"monetizedViews":251,"uniqueViews":327,"views":327},"downloadUrl":"https://www.mediafire.com/file/u17p3fxws0dcrjq/%25D8%25B1%25D9%258A%25D8%25B3%25D9%2588%25D8%25B1%25D8%25B3_%25D8%25A8%25D8%25A7%25D9%2583_%25D8%25A7%25D8%25B8%25D9%2587%25D8%25A7%25D8%25B1_%25D8%25A7%25D9%2584%25D9%2581%25D8%25B1%25D9%258A%25D9%2585%25D8%25A7%25D8%25AA_FPS_%255BOver_Hole%255D.mcpack/file","type":"Resource Pack","isVerified":true,"title":"ريسورس باك اظهار الفريمات (FPS)","youtubeUrl":"https://youtu.be/GHGp6wVySms"}', '2026-06-01T23:45:00.671Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-x-ray-👁️⛏️_1779998066084', 'RMKHLK', NULL, 'مود X-Ray 👁️⛏️', 'مود يسمح لك تشوف المعادن والكهوف تحت الأرض بسهولة عن طريق جعل أغلب البلوكات شفافة.
يساعدك تلقى الألماس، الحديد، الذهب، والموارد النادرة بسرعة بدون حفر عشوائي. بعض النسخ تسمح لك تحدد أي خامات تظهر وأي بلوكات تختفي، مما يجعل التنقيب أسرع وأسهل بكثير.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Resource Pack', 'غش', '1.26.20', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1779998064/azpta29u9uj9rszkuq6u.jpg',
        '[]', 'https://www.mediafire.com/file/p97ugy29hdj8qvw/x-ray_%255BOver_Hole%255D_.mcpack/file', '0.70MB', '{"averageRating":0,"downloads":5,"totalRatingScore":0,"dislikes":0,"ratingCount":0,"views":40,"uniqueViews":40,"likes":2}', NULL,
        '[]', '[]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"مود-x-ray-👁️⛏️_1779998066084","title":"مود X-Ray 👁️⛏️","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","platform":"Bedrock","minecraftVersion":"1.26.20","stats":{"averageRating":0,"downloads":5,"totalRatingScore":0,"dislikes":0,"ratingCount":0,"views":40,"uniqueViews":40,"likes":2},"type":"Resource Pack","downloadUrl":"https://www.mediafire.com/file/p97ugy29hdj8qvw/x-ray_%255BOver_Hole%255D_.mcpack/file","category":"غش","createdAt":"2026-05-28T19:54:24.454Z","shareCode":"RMKHLK","description":"مود يسمح لك تشوف المعادن والكهوف تحت الأرض بسهولة عن طريق جعل أغلب البلوكات شفافة.\nيساعدك تلقى الألماس، الحديد، الذهب، والموارد النادرة بسرعة بدون حفر عشوائي. بعض النسخ تسمح لك تحدد أي خامات تظهر وأي بلوكات تختفي، مما يجعل التنقيب أسرع وأسهل بكثير.","publisherName":"Over Hole - Mikey","price":0,"mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1779998064/azpta29u9uj9rszkuq6u.jpg","isVerified":true,"youtubeUrl":"","fileSize":"0.70MB","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png"}', '2026-05-28T19:54:24.454Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-ابواب-من-البلوكات_1784925443089', 'MTQX4J', NULL, 'مود ابواب من البلوكات', 'أضف أبوابًا وترابدورات مموهة تتنكر على شكل البلوكات، لتصنع مداخل سرية وقواعد مخفية بطريقة احترافية في ماين كرافت.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'زينة', '1.26.31+', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1784925442/drl0prujrcntjdj6iljk.png',
        '[]', 'https://www.mediafire.com/file/kzm04v4sg1gz4s8/CamouflageDoorAddon%255BOver_Hole%255D.mcaddon/file', '0.74MB', '{"views":171,"monetizedViews":45,"dislikes":0,"totalRatingScore":9,"averageRating":4.5,"uniqueViews":171,"likes":7,"userRatings":{"WnIJG2bYLMYLbnM2vb5pNZar4XB3":5,"gMtBHljM6ZZUD3QB9hcy8FdYCU63":4},"downloads":15,"ratingCount":2}', NULL,
        '[]', '["GqUuArdEiqPzv2xwH5RkiIFBylu1","WnIJG2bYLMYLbnM2vb5pNZar4XB3","T0gxbCDT2IT9chYQKYnoUtoS8dp2","gMtBHljM6ZZUD3QB9hcy8FdYCU63","7cQjE91PCvbvGiLColf7mOO0mx13","OjX2YkfmJJUQZHQ01J30CrJWPjE3"]', '[]', '{}', 'https://youtu.be/iSOJKbkPDKY?si', 0,
        'Bedrock', NULL, 0, '[]', 1,
        0, NULL, 1784925443086,
        NULL, '{"id":"مود-ابواب-من-البلوكات_1784925443089","monetizationEnabled":true,"platform":"Bedrock","dislikedBy":[],"publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","shareCode":"MTQX4J","likedBy":["GqUuArdEiqPzv2xwH5RkiIFBylu1","WnIJG2bYLMYLbnM2vb5pNZar4XB3","T0gxbCDT2IT9chYQKYnoUtoS8dp2","gMtBHljM6ZZUD3QB9hcy8FdYCU63","7cQjE91PCvbvGiLColf7mOO0mx13","OjX2YkfmJJUQZHQ01J30CrJWPjE3"],"createdAt":"2026-07-24T20:36:48.652Z","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","visibilityLevel":"public","type":"Mod","publisherName":"Over Hole - Mikey","stats":{"views":171,"monetizedViews":45,"dislikes":0,"totalRatingScore":9,"averageRating":4.5,"uniqueViews":171,"likes":7,"userRatings":{"WnIJG2bYLMYLbnM2vb5pNZar4XB3":5,"gMtBHljM6ZZUD3QB9hcy8FdYCU63":4},"downloads":15,"ratingCount":2},"downloadUrl":"https://www.mediafire.com/file/kzm04v4sg1gz4s8/CamouflageDoorAddon%255BOver_Hole%255D.mcaddon/file","youtubeUrl":"https://youtu.be/iSOJKbkPDKY?si","title":"مود ابواب من البلوكات","category":"زينة","isVerified":true,"description":"أضف أبوابًا وترابدورات مموهة تتنكر على شكل البلوكات، لتصنع مداخل سرية وقواعد مخفية بطريقة احترافية في ماين كرافت.","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1784925442/drl0prujrcntjdj6iljk.png","fileSize":"0.74MB","minecraftVersion":"1.26.31+","price":0,"monetizationActivatedAt":1784925443086}', '2026-07-24T20:36:48.652Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-اسلحة-الواردن_1779883783607', 'MXLHFN', NULL, 'مود اسلحة الواردن', 'يضيف أدوات وأسلحة ودروع مصنوعة من قوة الواردن والسكل كاتاليست، وتكون أقوى من الأدوات العادية بمراحل!
تقدر تحصل على سيف يسبب ضرر خارق، وبيكاكس سريع جداً، ودروع تعطيك قوة وتحمل رهيب. بعض النسخ من المود تضيف قدرات خاصة مثل الضربة الصوتية أو تأثيرات الظلام المخيفة الخاصة بالواردن.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'أسلحة', '1.26.20', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1779883782/vvgsegzuqfvstrw7zt1b.jpg',
        '[]', 'https://www.mediafire.com/file/6owa2w9pbuay2t1/WARDEN_WEAPONS%255BOver_Hole%255D.mcaddon/file', '2.40MB', '{"averageRating":5,"downloads":10,"ratingCount":1,"likes":2,"uniqueViews":40,"dislikes":0,"views":53,"commentsCount":1,"totalRatingScore":5}', NULL,
        '[{"id":"c_1785327162171j0fkm","userId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","username":"Over Hole - Mikey","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","text":"👍","createdAt":"2026-07-29T12:12:42.171Z"}]', '[]', '[]', '{"gMtBHljM6ZZUD3QB9hcy8FdYCU63":5}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"مود-اسلحة-الواردن_1779883783607","description":"يضيف أدوات وأسلحة ودروع مصنوعة من قوة الواردن والسكل كاتاليست، وتكون أقوى من الأدوات العادية بمراحل!\nتقدر تحصل على سيف يسبب ضرر خارق، وبيكاكس سريع جداً، ودروع تعطيك قوة وتحمل رهيب. بعض النسخ من المود تضيف قدرات خاصة مثل الضربة الصوتية أو تأثيرات الظلام المخيفة الخاصة بالواردن.","comments":[{"id":"c_1785327162171j0fkm","userId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","username":"Over Hole - Mikey","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","text":"👍","createdAt":"2026-07-29T12:12:42.171Z"}],"stats":{"averageRating":5,"downloads":10,"ratingCount":1,"likes":2,"uniqueViews":40,"dislikes":0,"views":53,"commentsCount":1,"totalRatingScore":5},"title":"مود اسلحة الواردن","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1779883782/vvgsegzuqfvstrw7zt1b.jpg","publisherName":"Over Hole - Mikey","fileSize":"2.40MB","minecraftVersion":"1.26.20","price":0,"platform":"Bedrock","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","type":"Mod","category":"أسلحة","downloadUrl":"https://www.mediafire.com/file/6owa2w9pbuay2t1/WARDEN_WEAPONS%255BOver_Hole%255D.mcaddon/file","ratedBy":{"gMtBHljM6ZZUD3QB9hcy8FdYCU63":5},"publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","createdAt":"2026-05-27T12:09:42.142Z","isVerified":true,"youtubeUrl":"","shareCode":"MXLHFN"}', '2026-05-27T12:09:42.142Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-اسلحة-نارية_1783106490561', 'MQXYVJ', NULL, 'مود اسلحة نارية', 'مود يضيف اسلحة حربية جديدة للعبة', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'أسلحة', '1.26.0', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1783106484/fmcjsaci3glrcixjp9sp.png',
        '[]', 'https://www.mediafire.com/file/gwzjwj3sjm6vsyj/TACZ_mod_V1.0.2_TRANSLATED_EDITION.mcaddon/file', '32MB', '{"ratingCount":0,"dislikes":0,"views":40,"uniqueViews":27,"downloads":5,"averageRating":0,"totalRatingScore":0,"likes":5}', NULL,
        '[]', '["gMtBHljM6ZZUD3QB9hcy8FdYCU63","WnIJG2bYLMYLbnM2vb5pNZar4XB3"]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"مود-اسلحة-نارية_1783106490561","price":0,"platform":"Bedrock","likedBy":["gMtBHljM6ZZUD3QB9hcy8FdYCU63","WnIJG2bYLMYLbnM2vb5pNZar4XB3"],"minecraftVersion":"1.26.0","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","downloadUrl":"https://www.mediafire.com/file/gwzjwj3sjm6vsyj/TACZ_mod_V1.0.2_TRANSLATED_EDITION.mcaddon/file","category":"أسلحة","visibilityLevel":"public","createdAt":"2026-07-03T19:21:23.091Z","shareCode":"MQXYVJ","dislikedBy":[],"description":"مود يضيف اسلحة حربية جديدة للعبة","stats":{"ratingCount":0,"dislikes":0,"views":40,"uniqueViews":27,"downloads":5,"averageRating":0,"totalRatingScore":0,"likes":5},"title":"مود اسلحة نارية","publisherName":"Over Hole - Mikey","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1783106484/fmcjsaci3glrcixjp9sp.png","type":"Mod","fileSize":"32MB","isVerified":true,"youtubeUrl":""}', '2026-07-03T19:21:23.091Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-اضافة-المتجر_1784915397877', 'MVU7LP', NULL, 'مود اضافة المتجر', 'أضف نظام متجر متكامل إلى عالم ماين كرافت! اشترِ وبِع العناصر بسهولة واستمتع بتجربة لعب أكثر متعة وتنظيماً.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'واقعي', '1.26.31+', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1784915397/fhwl1pqfhf76dhrszbw7.png',
        '[]', 'https://www.mediafire.com/file/578uwfx3f7nsunk/sshop2.7%255BOver_Hole%255D.mcaddon/file', '0.46MB', '{"uniqueViews":87,"monetizedViews":47,"totalRatingScore":0,"averageRating":0,"ratingCount":0,"likes":6,"downloads":10,"views":87,"dislikes":0}', NULL,
        '[]', '["WnIJG2bYLMYLbnM2vb5pNZar4XB3","T0gxbCDT2IT9chYQKYnoUtoS8dp2","gMtBHljM6ZZUD3QB9hcy8FdYCU63","WroWp6QOlHRBp0wHjvOCNA9Mfm32","8UkYbmT7qUQMY85myftNuEC9QZq2"]', '[]', '{}', 'https://youtu.be/iSOJKbkPDKY?si', 0,
        'Bedrock', NULL, 0, '[]', 1,
        0, NULL, 1784915397874,
        NULL, '{"id":"مود-اضافة-المتجر_1784915397877","monetizationActivatedAt":1784915397874,"publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","fileSize":"0.46MB","downloadUrl":"https://www.mediafire.com/file/578uwfx3f7nsunk/sshop2.7%255BOver_Hole%255D.mcaddon/file","visibilityLevel":"public","type":"Mod","minecraftVersion":"1.26.31+","publisherName":"Over Hole - Mikey","stats":{"uniqueViews":87,"monetizedViews":47,"totalRatingScore":0,"averageRating":0,"ratingCount":0,"likes":6,"downloads":10,"views":87,"dislikes":0},"mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1784915397/fhwl1pqfhf76dhrszbw7.png","monetizationEnabled":true,"title":"مود اضافة المتجر","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","likedBy":["WnIJG2bYLMYLbnM2vb5pNZar4XB3","T0gxbCDT2IT9chYQKYnoUtoS8dp2","gMtBHljM6ZZUD3QB9hcy8FdYCU63","WroWp6QOlHRBp0wHjvOCNA9Mfm32","8UkYbmT7qUQMY85myftNuEC9QZq2"],"category":"واقعي","dislikedBy":[],"youtubeUrl":"https://youtu.be/iSOJKbkPDKY?si","price":0,"isVerified":true,"platform":"Bedrock","description":"أضف نظام متجر متكامل إلى عالم ماين كرافت! اشترِ وبِع العناصر بسهولة واستمتع بتجربة لعب أكثر متعة وتنظيماً.","shareCode":"MVU7LP","createdAt":"2026-07-24T17:49:52.257Z"}', '2026-07-24T17:49:52.257Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-التكسير-بضربة-واحدة_1784545541422', 'M9VNBS', NULL, 'مود التكسير بضربة واحدة', 'مود يسمح لك بتكسير الاورات و الاشجار بضربة واحدة بأستخدام البيكاكس و الاكس او اي ادوات من مودات اخرى', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'أدوات', '1.26.3', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1784545540/shicmzmky4ryzv3utykx.png',
        '[]', 'https://www.mediafire.com/file/c3r2heec6tyjvu7/VeinCapitator_3.0.0%255BOver_Hole%255D.mcaddon/file', '0.17MB', '{"monetizedViews":170,"totalRatingScore":0,"views":169,"averageRating":0,"downloads":15,"dislikes":0,"uniqueViews":169,"commentsCount":1,"likes":3,"ratingCount":0}', NULL,
        '[{"createdAt":"2026-08-24T18:57:42.877538Z","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","id":"c_1787597862877","text":"مود حلوا","userId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","username":"Over Hole - Mikey"}]', '["gMtBHljM6ZZUD3QB9hcy8FdYCU63","ShD9a8Qc4XZ0JAP58Hcozhpa8pg1"]', '[]', '{}', 'https://youtu.be/iSOJKbkPDKY?si=xo3FFCAe3SuVHSng', 0,
        'Bedrock', NULL, 0, '[]', 1,
        0, NULL, 1784545541418,
        NULL, '{"id":"مود-التكسير-بضربة-واحدة_1784545541422","title":"مود التكسير بضربة واحدة","youtubeUrl":"https://youtu.be/iSOJKbkPDKY?si=xo3FFCAe3SuVHSng","stats":{"monetizedViews":170,"totalRatingScore":0,"views":169,"averageRating":0,"downloads":15,"dislikes":0,"uniqueViews":169,"commentsCount":1,"likes":3,"ratingCount":0},"fileSize":"0.17MB","dislikedBy":[],"type":"Mod","visibilityLevel":"public","description":"مود يسمح لك بتكسير الاورات و الاشجار بضربة واحدة بأستخدام البيكاكس و الاكس او اي ادوات من مودات اخرى","price":0,"monetizationEnabled":true,"publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","publisherName":"Over Hole - Mikey","platform":"Bedrock","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1784545540/shicmzmky4ryzv3utykx.png","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","isVerified":true,"monetizationActivatedAt":1784545541418,"minecraftVersion":"1.26.3","comments":[{"createdAt":"2026-08-24T18:57:42.877538Z","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","id":"c_1787597862877","text":"مود حلوا","userId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","username":"Over Hole - Mikey"}],"likedBy":["gMtBHljM6ZZUD3QB9hcy8FdYCU63","ShD9a8Qc4XZ0JAP58Hcozhpa8pg1"],"downloadUrl":"https://www.mediafire.com/file/c3r2heec6tyjvu7/VeinCapitator_3.0.0%255BOver_Hole%255D.mcaddon/file","category":"أدوات","createdAt":"2026-07-20T11:05:33.432Z","shareCode":"M9VNBS"}', '2026-07-20T11:05:33.432Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-الشيلدات-الاضافية_1783108504417', 'MC7HGC', NULL, 'مود الشيلدات الاضافية', 'يضيف هذا المود مجموعة من الشيلدات الجديدة، لكل منها قدرات وميزات خاصة تمنحك حماية وتجربة لعب أكثر متعة.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'أدوات', '1.26.31', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1783108505/h18k6v6iguqlvhgd7eso.jpg',
        '[]', 'https://www.mediafire.com/file/bo1ui5z751eyeos/Vanilla_Shields%255BOver_Hole%255D.mcaddon/file', '0.9MB', '{"ratingCount":0,"averageRating":0,"uniqueViews":50,"totalRatingScore":0,"likes":2,"views":50,"dislikes":1,"downloads":3}', NULL,
        '[]', '["gMtBHljM6ZZUD3QB9hcy8FdYCU63"]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"مود-الشيلدات-الاضافية_1783108504417","youtubeUrl":"","shareCode":"MC7HGC","platform":"Bedrock","isVerified":true,"createdAt":"2026-07-03T19:55:02.670Z","type":"Mod","downloadUrl":"https://www.mediafire.com/file/bo1ui5z751eyeos/Vanilla_Shields%255BOver_Hole%255D.mcaddon/file","visibilityLevel":"public","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","title":"مود الشيلدات الاضافية","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","stats":{"ratingCount":0,"averageRating":0,"uniqueViews":50,"totalRatingScore":0,"likes":2,"views":50,"dislikes":1,"downloads":3},"category":"أدوات","minecraftVersion":"1.26.31","likedBy":["gMtBHljM6ZZUD3QB9hcy8FdYCU63"],"mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1783108505/h18k6v6iguqlvhgd7eso.jpg","fileSize":"0.9MB","price":0,"description":"يضيف هذا المود مجموعة من الشيلدات الجديدة، لكل منها قدرات وميزات خاصة تمنحك حماية وتجربة لعب أكثر متعة.","publisherName":"Over Hole - Mikey"}', '2026-07-03T19:55:02.670Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-الواي-ستون_1783106885609', 'M2QVST', NULL, 'مود الواي ستون', 'يضيف مود الواي ستون نظام انتقال سريع بين الأماكن التي تقوم بتفعيلها، مما يسهل التنقل ويوفر الوقت أثناء الاستكشاف وبناء عالمك.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'تقني', '1.26.31+', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1783106886/tocr0sl36xsqu9dust2v.jpg',
        '[]', 'https://www.mediafire.com/file/5aft5gtvl5nr6fp/Simple_Waystone_v8.2_Full%255BOver_Hole%255D.mcaddon/file', '0.5MB', '{"dislikes":0,"averageRating":0,"likes":2,"totalRatingScore":0,"uniqueViews":129,"commentsCount":1,"downloads":15,"ratingCount":0,"views":129}', NULL,
        '[{"id":"c_1784734120935i8lz8","userId":"G6Zi5RZmc0fvkAhPbpAKZnj18q22","username":"باقر العراقي","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1784733066/G6Zi5RZmc0fvkAhPbpAKZnj18q22.png","text":"هل هذا المود فيه مايك","createdAt":"2026-07-22T15:28:40.935Z"}]', '["6AcjQABuI8Ufh1qIQRhUPthy6li1"]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"مود-الواي-ستون_1783106885609","category":"تقني","price":0,"description":"يضيف مود الواي ستون نظام انتقال سريع بين الأماكن التي تقوم بتفعيلها، مما يسهل التنقل ويوفر الوقت أثناء الاستكشاف وبناء عالمك.","minecraftVersion":"1.26.31+","publisherName":"Over Hole - Mikey","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1783106886/tocr0sl36xsqu9dust2v.jpg","platform":"Bedrock","visibilityLevel":"public","isVerified":true,"stats":{"dislikes":0,"averageRating":0,"likes":2,"totalRatingScore":0,"uniqueViews":129,"commentsCount":1,"downloads":15,"ratingCount":0,"views":129},"youtubeUrl":"","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","title":"مود الواي ستون","fileSize":"0.5MB","createdAt":"2026-07-03T19:28:04.004Z","shareCode":"M2QVST","comments":[{"id":"c_1784734120935i8lz8","userId":"G6Zi5RZmc0fvkAhPbpAKZnj18q22","username":"باقر العراقي","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1784733066/G6Zi5RZmc0fvkAhPbpAKZnj18q22.png","text":"هل هذا المود فيه مايك","createdAt":"2026-07-22T15:28:40.935Z"}],"type":"Mod","downloadUrl":"https://www.mediafire.com/file/5aft5gtvl5nr6fp/Simple_Waystone_v8.2_Full%255BOver_Hole%255D.mcaddon/file","likedBy":["6AcjQABuI8Ufh1qIQRhUPthy6li1"]}', '2026-07-03T19:28:04.004Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-اورات-اضافية_1783110166030', 'MH99LH', NULL, 'مود اورات اضافية', 'يضيف هذا المود خامات جديدة يمكنك استخراجها وصناعة دروع، وسيوف، وأدوات قوية منها، لتجربة لعب أكثر تنوعًا وتحديًا.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'أدوات', '1.26.30+', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1783110166/lmbqynprumzyhckncvml.png',
        '[]', 'https://www.mediafire.com/file/ud190y5krzw0pw3/BP-RP_MTA_v6.8.5%255BOver_Hole%255D.mcaddon/file', '1.38MB', '{"ratingCount":0,"averageRating":0,"downloads":12,"views":177,"totalRatingScore":0,"uniqueViews":177,"likes":14,"dislikes":0}', NULL,
        '[]', '["gMtBHljM6ZZUD3QB9hcy8FdYCU63"]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"مود-اورات-اضافية_1783110166030","title":"مود اورات اضافية","minecraftVersion":"1.26.30+","isVerified":true,"youtubeUrl":"","stats":{"ratingCount":0,"averageRating":0,"downloads":12,"views":177,"totalRatingScore":0,"uniqueViews":177,"likes":14,"dislikes":0},"description":"يضيف هذا المود خامات جديدة يمكنك استخراجها وصناعة دروع، وسيوف، وأدوات قوية منها، لتجربة لعب أكثر تنوعًا وتحديًا.","platform":"Bedrock","category":"أدوات","dislikedBy":[],"mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1783110166/lmbqynprumzyhckncvml.png","publisherName":"Over Hole - Mikey","type":"Mod","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","price":0,"createdAt":"2026-07-03T20:22:43.829Z","visibilityLevel":"public","likedBy":["gMtBHljM6ZZUD3QB9hcy8FdYCU63"],"shareCode":"MH99LH","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","downloadUrl":"https://www.mediafire.com/file/ud190y5krzw0pw3/BP-RP_MTA_v6.8.5%255BOver_Hole%255D.mcaddon/file","fileSize":"1.38MB"}', '2026-07-03T20:22:43.829Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-بتاع-كلو-🛠_1779884359590', 'M5XBD7', NULL, 'مود بتاع كلو 🛠', 'يضيف أداة أسطورية تجمع البكاكس والسيف والفأس والشفل في أداة واحدة!
تقدر تحفر، تقطع الأشجار، تهاجم، وتكسر بسرعة بدون تبديل الأدوات كل شوي. المود ممتاز لتوفير الوقت ويخلي اللعب أسرع وأسهل خصوصاً في البقاء والاستكشاف.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'أدوات', '1.26.20', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1779884358/pvsfyhmfms8gfrygcimo.png',
        '[]', 'https://download1085.mediafire.com/ubcnmwahtoggE84JLGuhyLNu_VgF5I4Ws0G5yXN5IHmNo0xBdhSSJrFVJcymRxK43esQhyfnw_rGlOzX5UaHnAmrYsA72lCSNB7RMCjkZhloEagPx5opkMZZl25p4b_y5nTg6qhCP0D9itStlCf-G93paX86XsCRjWFAAh5KsnaFyg/6i9u89veruv4fil/%D9%85%D9%88%D8%AF+%D8%A8%D8%AA%D8%A7%D8%B9+%D9%83%D9%84%D9%88.mcaddon', '0.3MB', '{"likes":2,"downloads":9,"totalRatingScore":3.5,"uniqueViews":156,"views":156,"ratingCount":1,"monetizedViews":124,"dislikes":0,"averageRating":3.5}', NULL,
        '[]', '["gMtBHljM6ZZUD3QB9hcy8FdYCU63"]', '[]', '{"gMtBHljM6ZZUD3QB9hcy8FdYCU63":3.5}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 1,
        0, NULL, 1785327097946,
        NULL, '{"id":"مود-بتاع-كلو-🛠_1779884359590","stats":{"likes":2,"downloads":9,"totalRatingScore":3.5,"uniqueViews":156,"views":156,"ratingCount":1,"monetizedViews":124,"dislikes":0,"averageRating":3.5},"isVerified":true,"title":"مود بتاع كلو 🛠","publisherName":"Over Hole - Mikey","youtubeUrl":"","description":"يضيف أداة أسطورية تجمع البكاكس والسيف والفأس والشفل في أداة واحدة!\nتقدر تحفر، تقطع الأشجار، تهاجم، وتكسر بسرعة بدون تبديل الأدوات كل شوي. المود ممتاز لتوفير الوقت ويخلي اللعب أسرع وأسهل خصوصاً في البقاء والاستكشاف.","platform":"Bedrock","monetizationEnabled":true,"publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","category":"أدوات","likedBy":["gMtBHljM6ZZUD3QB9hcy8FdYCU63"],"mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1779884358/pvsfyhmfms8gfrygcimo.png","visibilityLevel":"public","type":"Mod","price":0,"publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","minecraftVersion":"1.26.20","createdAt":"2026-05-27T12:19:17.915Z","monetizationActivatedAt":1785327097946,"shareCode":"M5XBD7","downloadUrl":"https://download1085.mediafire.com/ubcnmwahtoggE84JLGuhyLNu_VgF5I4Ws0G5yXN5IHmNo0xBdhSSJrFVJcymRxK43esQhyfnw_rGlOzX5UaHnAmrYsA72lCSNB7RMCjkZhloEagPx5opkMZZl25p4b_y5nTg6qhCP0D9itStlCf-G93paX86XsCRjWFAAh5KsnaFyg/6i9u89veruv4fil/%D9%85%D9%88%D8%AF+%D8%A8%D8%AA%D8%A7%D8%B9+%D9%83%D9%84%D9%88.mcaddon","fileSize":"0.3MB","ratedBy":{"gMtBHljM6ZZUD3QB9hcy8FdYCU63":3.5}}', '2026-05-27T12:19:17.915Z', '2026-11-08T13:46:39.232Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-حمل-الموبات-والصناديق-📦🐄_1779884604313', 'MD5XRF', NULL, 'مود حمل الموبات والصناديق 📦🐄', 'مود ممتع يسمح لك تحمل أي موب أو صندوق بسهولة بدون تكسير أو استعمال أوامر.
تقدر تشيل الحيوانات، القرويين، الوحوش، وحتى الصناديق وتنقلهم لأي مكان تبيه بسرعة. مفيد جداً لتنظيم القواعد، نقل الموارد، أو بناء المزارع بدون تعب', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'واقعي', '1.26.20', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1779884603/ltdyomn31al9mrmpqfo2.jpg',
        '[]', NULL, '1.06MB', '{"uniqueViews":95,"totalRatingScore":9.5,"likes":4,"ratingCount":2,"dislikes":0,"downloads":3,"views":95,"averageRating":4.8,"monetizedViews":58}', NULL,
        '[]', '["kS9FtTVJ0GfiHvHqQze9TREhWIJ3"]', '[]', '{"WnIJG2bYLMYLbnM2vb5pNZar4XB3":5,"gMtBHljM6ZZUD3QB9hcy8FdYCU63":4.5}', NULL, 10,
        'Bedrock', 'Forge', 0, '[]', 1,
        0, NULL, NULL,
        68, '{"id":"مود-حمل-الموبات-والصناديق-📦🐄_1779884604313","monetizationSuspendedReason":"","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","platform":"Bedrock","minecraftVersion":"1.26.20","customAdRate":68,"youtubeUrl":"","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","fileSize":"1.06MB","visibilityLevel":"public","modLoader":"Forge","monetizationEnabled":true,"dislikedBy":[],"category":"واقعي","createdAt":"2026-05-27T12:23:23.657Z","shareCode":"MD5XRF","ratedBy":{"WnIJG2bYLMYLbnM2vb5pNZar4XB3":5,"gMtBHljM6ZZUD3QB9hcy8FdYCU63":4.5},"stats":{"uniqueViews":95,"totalRatingScore":9.5,"likes":4,"ratingCount":2,"dislikes":0,"downloads":3,"views":95,"averageRating":4.8,"monetizedViews":58},"title":"مود حمل الموبات والصناديق 📦🐄","description":"مود ممتع يسمح لك تحمل أي موب أو صندوق بسهولة بدون تكسير أو استعمال أوامر.\nتقدر تشيل الحيوانات، القرويين، الوحوش، وحتى الصناديق وتنقلهم لأي مكان تبيه بسرعة. مفيد جداً لتنظيم القواعد، نقل الموارد، أو بناء المزارع بدون تعب","publisherName":"Over Hole - Mikey","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1779884603/ltdyomn31al9mrmpqfo2.jpg","isVerified":true,"price":10,"monetizationSuspended":false,"type":"Mod","likedBy":["kS9FtTVJ0GfiHvHqQze9TREhWIJ3"]}', '2026-05-27T12:23:23.657Z', '2026-11-08T13:46:39.233Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-صناديق-و-الافران-الجديدة_1783109822871', 'MA6QQ3', NULL, 'مود صناديق و الافران الجديدة', 'يضيف هذا المود صناديق وأفران مصنوعة من الحديد والذهب والألماس ومواد أخرى، مع سعة أكبر وأداء أفضل لتسهيل التخزين والصهر.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Mod', 'تقني', '1.26.3', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1783109823/honvktzhjzkqdo4jxmka.jpg',
        '[]', 'https://www.mediafire.com/file/cuq2pxcnjixmuri/Beyond_Storage_%2526_Smelting.mcaddon/file', '0.41MB', '{"totalRatingScore":0,"downloads":6,"ratingCount":0,"views":78,"commentsCount":1,"uniqueViews":78,"dislikes":0,"likes":0,"averageRating":0}', NULL,
        '[{"id":"c_1786724488608wkw5j","userId":"WnIJG2bYLMYLbnM2vb5pNZar4XB3","username":"Over Mods","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1777032867/WnIJG2bYLMYLbnM2vb5pNZar4XB3.jpg","text":"هلا","createdAt":"2026-08-14T16:21:28.609Z"}]', '[]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"مود-صناديق-و-الافران-الجديدة_1783109822871","isVerified":true,"youtubeUrl":"","likedBy":[],"fileSize":"0.41MB","price":0,"description":"يضيف هذا المود صناديق وأفران مصنوعة من الحديد والذهب والألماس ومواد أخرى، مع سعة أكبر وأداء أفضل لتسهيل التخزين والصهر.","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1783109823/honvktzhjzkqdo4jxmka.jpg","comments":[{"id":"c_1786724488608wkw5j","userId":"WnIJG2bYLMYLbnM2vb5pNZar4XB3","username":"Over Mods","userAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1777032867/WnIJG2bYLMYLbnM2vb5pNZar4XB3.jpg","text":"هلا","createdAt":"2026-08-14T16:21:28.609Z"}],"dislikedBy":[],"type":"Mod","title":"مود صناديق و الافران الجديدة","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","category":"تقني","stats":{"totalRatingScore":0,"downloads":6,"ratingCount":0,"views":78,"commentsCount":1,"uniqueViews":78,"dislikes":0,"likes":0,"averageRating":0},"visibilityLevel":"public","platform":"Bedrock","publisherName":"Over Hole - Mikey","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","createdAt":"2026-07-03T20:17:00.714Z","downloadUrl":"https://www.mediafire.com/file/cuq2pxcnjixmuri/Beyond_Storage_%2526_Smelting.mcaddon/file","minecraftVersion":"1.26.3","shareCode":"MA6QQ3"}', '2026-07-03T20:17:00.714Z', '2026-11-08T13:46:39.233Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'مود-فلوس-مصريه_1787819255388', 'MQTXDD', NULL, 'مود فلوس مصريه', 'لقد صنعت مود فلوس مصريه الي يبغاه قناتي اسمها 
@ميجو-777', 'public',
        'MBRCI6QHC6OHX70iQMimo3UCHw02', 'Mod', 'ديكور', '1.26.44', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1787819251/xsdjmbjiilyiu9518szu.png',
        '[]', 'https://www.mediafire.com/file/qo59odt3ggsao1r/Egyptian_Currency.mcaddon/file', '0.028MB', '{"ratingCount":0,"averageRating":0,"views":9,"totalRatingScore":0,"uniqueViews":9,"likes":1,"downloads":0,"dislikes":0}', NULL,
        '[]', '[]', '[]', '{}', 'https://youtu.be/DzL7nJlJRto?si=_9kMDB52_AJUeXb5', 2,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"مود-فلوس-مصريه_1787819255388","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1787819048/MBRCI6QHC6OHX70iQMimo3UCHw02.jpg","type":"Mod","mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1787819251/xsdjmbjiilyiu9518szu.png","downloadUrl":"https://www.mediafire.com/file/qo59odt3ggsao1r/Egyptian_Currency.mcaddon/file","likedBy":[],"visibilityLevel":"public","category":"ديكور","publisherName":"ميجو777","platform":"Bedrock","publisherId":"MBRCI6QHC6OHX70iQMimo3UCHw02","title":"مود فلوس مصريه","stats":{"ratingCount":0,"averageRating":0,"views":9,"totalRatingScore":0,"uniqueViews":9,"likes":1,"downloads":0,"dislikes":0},"fileSize":"0.028MB","youtubeUrl":"https://youtu.be/DzL7nJlJRto?si=_9kMDB52_AJUeXb5","shareCode":"MQTXDD","isVerified":false,"minecraftVersion":"1.26.44","createdAt":"2026-08-27T08:27:29.380Z","dislikedBy":[],"monetizationEnabled":false,"price":2,"description":"لقد صنعت مود فلوس مصريه الي يبغاه قناتي اسمها \n@ميجو-777"}', '2026-08-27T08:27:29.380Z', '2026-11-08T13:46:39.233Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;
INSERT INTO mods (
        id, shareCode, modCode, title, description, visibilityLevel,
        publisherId, type, category, minecraftVersion, mainImage,
        additionalImages, downloadUrl, fileSize, stats, fakeStats,
        comments, likedBy, dislikedBy, ratedBy, youtubeUrl, price,
        platform, modLoader, disableAds, creatorAdCodes, monetizationEnabled,
        monetizationSuspended, monetizationSuspendedReason, monetizationActivatedAt,
        customAdRate, raw_data, createdAt, updatedAt
      ) VALUES (
        'وان-بلوك_1783112337938', 'MJ5GSX', NULL, 'وان بلوك', 'ابدأ مغامرتك فوق بلوكة واحدة فقط، واكسرها باستمرار للحصول على موارد جديدة وتوسيع جزيرتك حتى تبني عالمًا متكاملًا.', 'public',
        'gMtBHljM6ZZUD3QB9hcy8FdYCU63', 'Map', 'مغامرة', '1.26.30', 'https://res.cloudinary.com/dfsgv8uda/image/upload/v1783112338/gzy8narfxqzqxsl8xnu7.jpg',
        '[]', 'https://www.mediafire.com/file/pqa0kbycvjd0krb/One_Block_%2528Chaos_Cubed%2521%2529_v-1.7.0_by_DtA_MC%2521.mcworld/file', '7.19MB', '{"ratingCount":0,"views":37,"downloads":11,"likes":2,"totalRatingScore":0,"averageRating":0,"dislikes":0,"uniqueViews":20}', NULL,
        '[]', '["gMtBHljM6ZZUD3QB9hcy8FdYCU63","YxyFcpjVrOQ8jw7Vw2aR1ZviqZo2"]', '[]', '{}', NULL, 0,
        'Bedrock', NULL, 0, '[]', 0,
        0, NULL, NULL,
        NULL, '{"id":"وان-بلوك_1783112337938","publisherId":"gMtBHljM6ZZUD3QB9hcy8FdYCU63","minecraftVersion":"1.26.30","fileSize":"7.19MB","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1776972578/gMtBHljM6ZZUD3QB9hcy8FdYCU63.png","price":0,"shareCode":"MJ5GSX","visibilityLevel":"public","createdAt":"2026-07-03T20:58:56.339Z","downloadUrl":"https://www.mediafire.com/file/pqa0kbycvjd0krb/One_Block_%2528Chaos_Cubed%2521%2529_v-1.7.0_by_DtA_MC%2521.mcworld/file","type":"Map","stats":{"ratingCount":0,"views":37,"downloads":11,"likes":2,"totalRatingScore":0,"averageRating":0,"dislikes":0,"uniqueViews":20},"mainImage":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1783112338/gzy8narfxqzqxsl8xnu7.jpg","title":"وان بلوك","description":"ابدأ مغامرتك فوق بلوكة واحدة فقط، واكسرها باستمرار للحصول على موارد جديدة وتوسيع جزيرتك حتى تبني عالمًا متكاملًا.","youtubeUrl":"","category":"مغامرة","isVerified":true,"likedBy":["gMtBHljM6ZZUD3QB9hcy8FdYCU63","YxyFcpjVrOQ8jw7Vw2aR1ZviqZo2"],"dislikedBy":[],"platform":"Bedrock","publisherName":"Over Hole - Mikey"}', '2026-07-03T20:58:56.339Z', '2026-11-08T13:46:39.233Z'
      ) ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, description=excluded.description, stats=excluded.stats,
        comments=excluded.comments, likedBy=excluded.likedBy, dislikedBy=excluded.dislikedBy;

-- ==========================================
-- TABLE: servers (1 records)
-- ==========================================
INSERT INTO servers (
        id, title, description, ip, port, version, type, serverType,
        edition, platform, category, publisherId, status, isOnline,
        javaStatus, bedrockStatus, onlinePlayers, maxPlayers, motd, ping,
        lastChecked, raw_data, createdAt, updatedAt
      ) VALUES (
        'server_1787515110206', 'server', 'testing servers', 'play.example.com', '19132', '1.21', 'Server', 'Bedrock',
        'Bedrock', NULL, 'SMP', 'WnIJG2bYLMYLbnM2vb5pNZar4XB3', 'offline', 0,
        'offline', 'offline', 0, 0, NULL, NULL,
        NULL, '{"id":"server_1787515110206","publisherId":"WnIJG2bYLMYLbnM2vb5pNZar4XB3","version":"1.21","createdAt":"2026-08-23T19:58:30.205Z","port":"19132","publisherName":"Over Mods","title":"server","category":"SMP","ip":"play.example.com","type":"Server","publisherAvatar":"https://res.cloudinary.com/dfsgv8uda/image/upload/v1777032867/WnIJG2bYLMYLbnM2vb5pNZar4XB3.jpg","stats":{"averageRating":0,"uniqueViews":0,"ratingCount":0,"dislikes":0,"likes":0,"totalRatingScore":0,"downloads":0,"views":0},"description":"testing servers","edition":"Bedrock","isVerified":false,"serverType":"Bedrock"}', '2026-08-23T19:58:30.205Z', '2026-11-08T13:46:40.208Z'
      ) ON CONFLICT(id) DO UPDATE SET status=excluded.status, isOnline=excluded.isOnline;

